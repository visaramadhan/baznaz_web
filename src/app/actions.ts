'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { Group } from '@/models/Group';
import { GroupMember } from '@/models/GroupMember';
import { Installment } from '@/models/Installment';
import { Profile } from '@/models/Profile';

export async function getDashboardStats() {
  await dbConnect();

  // Get Profile
  let profile = await Profile.findOne({});
  if (!profile) {
    profile = await Profile.create({
      nama: 'BAZNAS Microfinance Desa',
      alamat: 'Kota Bukittinggi',
      telp: '',
      logo: ''
    });
  }

  // Get Account IDs
  const kasAccount = await Estimation.findOne({ nomor_akun: '111' });
  const piutangAccount = await Estimation.findOne({ nomor_akun: '112' });
  const danaProgramAccount = await Estimation.findOne({ nomor_akun: '310' }); // Assuming 310 is Dana Program/Modal

  // Helper to calculate balance
  async function getBalance(accountId: string, type: 'debit' | 'credit' = 'debit') {
    if (!accountId) return 0;
    const debit = await Journal.aggregate([
      { $match: { debit_account_id: accountId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const credit = await Journal.aggregate([
      { $match: { credit_account_id: accountId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const debitTotal = debit[0]?.total || 0;
    const creditTotal = credit[0]?.total || 0;
    
    return type === 'debit' ? debitTotal - creditTotal : creditTotal - debitTotal;
  }

  const kasBalance = await getBalance(kasAccount?._id, 'debit');
  const piutangBalance = await getBalance(piutangAccount?._id, 'debit');
  const danaProgramBalance = await getBalance(danaProgramAccount?._id, 'credit');

  // Transaction Stats
  const totalPinjamanResult = await Loan.aggregate([
    { $group: { _id: null, total: { $sum: '$jumlah_pinjaman' } } }
  ]);
  const totalPinjaman = totalPinjamanResult[0]?.total || 0;

  const totalAngsuranResult = await Installment.aggregate([
    { $group: { _id: null, total: { $sum: '$jumlah_bayar' } } }
  ]);
  const totalAngsuran = totalAngsuranResult[0]?.total || 0;

  const jumlahKelompok = await Group.countDocuments();
  const jumlahAnggota = await GroupMember.countDocuments();

  // Recent Journals
  const recentJournals = await Journal.find({})
    .sort({ tanggal: -1 })
    .limit(5)
    .populate('debit_account_id', 'nama')
    .populate('credit_account_id', 'nama');

  return {
    profile: JSON.parse(JSON.stringify(profile)),
    danaProgram: danaProgramBalance,
    pinjamanTersalurkan: totalPinjaman,
    totalAngsuran: totalAngsuran,
    saldoPiutang: piutangBalance,
    jumlahKelompok,
    jumlahAnggota,
    recentJournals: JSON.parse(JSON.stringify(recentJournals))
  };
}
