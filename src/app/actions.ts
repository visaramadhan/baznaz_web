'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Journal } from '@/models/Journal';
import { Group } from '@/models/Group';
import { GroupMember } from '@/models/GroupMember';
import { Installment } from '@/models/Installment';
import { Profile } from '@/models/Profile';
import { getBalanceSheetData } from './laporan-keuangan/actions';

export async function getDashboardStats() {
  await dbConnect();

  // 1. Profil lembaga
  let profile = await Profile.findOne({});
  if (!profile) {
    profile = await Profile.create({
      nama: 'BAZNAS Microfinance Desa',
      alamat: 'Kota Bukittinggi',
      telp: '',
      logo: ''
    });
  }

  // 2. Dana Program (diambil dari Laporan Posisi Keuangan -> Dana Program)
  const balanceSheet = await getBalanceSheetData();
  const danaProgramBalance = balanceSheet.equity.total || 0;

  // 3. Statistik pinjaman & angsuran berbasis data Loan dan Installment
  const totalPinjamanResult = await Loan.aggregate([
    { $group: { _id: null, total: { $sum: '$jumlah' } } }
  ]);
  const totalPinjaman = totalPinjamanResult[0]?.total || 0;

  const totalAngsuranResult = await Installment.aggregate([
    { $group: { _id: null, total: { $sum: '$jumlah_bayar' } } }
  ]);
  const totalAngsuran = totalAngsuranResult[0]?.total || 0;

  const saldoPiutang = totalPinjaman - totalAngsuran;

  // 4. Statistik kelompok & anggota
  const jumlahKelompok = await Group.countDocuments();
  const jumlahAnggota = await GroupMember.countDocuments();

  // 5. Jurnal terbaru
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
    saldoPiutang,
    jumlahKelompok,
    jumlahAnggota,
    recentJournals: JSON.parse(JSON.stringify(recentJournals))
  };
}
