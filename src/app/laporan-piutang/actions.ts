
'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Group } from '@/models/Group';
import { Installment } from '@/models/Installment';
import { GroupMember } from '@/models/GroupMember';

export async function getReceivableReportData(startDate: string, endDate: string) {
  await dbConnect();

  const loans = await Loan.find({}).populate('group_id');

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const installmentsToEnd = await Installment.aggregate([
    { $match: { tanggal_bayar: { $lte: end } } },
    {
      $group: {
        _id: '$loan_id',
        totalPaidToDate: { $sum: '$jumlah_bayar' },
        countToDate: { $sum: 1 }
      }
    }
  ]);

  const installmentsInRange = await Installment.aggregate([
    { $match: { tanggal_bayar: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$loan_id',
        totalPaidInRange: { $sum: '$jumlah_bayar' },
        countInRange: { $sum: 1 }
      }
    }
  ]);

  const toDateMap = new Map(installmentsToEnd.map(i => [i._id.toString(), i]));
  const inRangeMap = new Map(installmentsInRange.map(i => [i._id.toString(), i]));

  const groupIds = loans
    .map((l: any) => (l as any).group_id?._id)
    .filter(Boolean);

  const members = await GroupMember.find({ group_id: { $in: groupIds } });
  const membersByGroup = new Map<string, any[]>();
  members.forEach((m: any) => {
    const key = m.group_id.toString();
    if (!membersByGroup.has(key)) membersByGroup.set(key, []);
    membersByGroup.get(key)!.push(m);
  });

  const reportData = loans.map((loan) => {
    const toDate = toDateMap.get(loan._id.toString()) || { totalPaidToDate: 0, countToDate: 0 };
    const inRange = inRangeMap.get(loan._id.toString()) || { totalPaidInRange: 0, countInRange: 0 };
    const groupIdStr = ((loan as any).group_id?._id?.toString?.()) || '';
    const groupMembers = (membersByGroup.get(groupIdStr) || []).sort((a, b) => (a.no_anggota || '').localeCompare(b.no_anggota || ''));

    const balance = loan.jumlah - toDate.totalPaidToDate;
    const memberCount = groupMembers.length || 1; // avoid division by zero
    const perMemberPaidInRange = inRange.totalPaidInRange / memberCount;
    const perMemberPaidToDate = toDate.totalPaidToDate / memberCount;

    return {
      _id: loan._id.toString(),
      no_kelompok: (loan as any).group_id?.nomor || '-',
      nama_kelompok: (loan as any).group_id?.nama || 'Unknown Group',
      jumlah_pinjaman: loan.jumlah,
      angsuran_ke: toDate.countToDate,
      jumlah_angsuran: inRange.totalPaidInRange,
      saldo: balance,
      status: loan.status,
      nomor_transaksi: loan.nomor_transaksi,
      members: groupMembers.map((m: any) => {
        const pinjaman = loan.jumlah_per_anggota;
        const angsuran = perMemberPaidInRange;
        const saldo = pinjaman - perMemberPaidToDate;
        return {
          _id: m._id.toString(),
          no_anggota: m.no_anggota,
          nama: m.nama,
          jabatan: m.jabatan,
          pinjaman,
          angsuran,
          saldo
        };
      })
    };
  });

  // Sort by Group Number if possible, otherwise by name
  return reportData.sort((a, b) => a.no_kelompok.localeCompare(b.no_kelompok));
}
