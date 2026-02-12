'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { Group } from '@/models/Group';
import { FundSource } from '@/models/FundSource';
import { revalidatePath } from 'next/cache';

export async function getGroups() {
  await dbConnect();
  const groups = await Group.find({}, 'nama _id');
  return JSON.parse(JSON.stringify(groups));
}

export async function getFundSources() {
  await dbConnect();
  const funds = await FundSource.find({}, 'name _id');
  return JSON.parse(JSON.stringify(funds));
}

export async function createLoan(formData: FormData) {
  await dbConnect();
  
  const group_id = formData.get('group_id') as string;
  const fund_source_id = formData.get('fund_source_id') as string;
  const jumlah = parseFloat(formData.get('jumlah') as string);
  const jangka_waktu = parseInt(formData.get('jangka_waktu') as string);
  const margin = parseFloat(formData.get('margin') as string);

  try {
    // Generate Nomor Transaksi
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const nomor_transaksi = `PJ-${yyyy}${mm}${dd}-${random}`;

    // 1. Create Loan
    const loan = await Loan.create({
      nomor_transaksi,
      group_id,
      fund_source_id,
      jumlah,
      jangka_waktu,
      margin,
      status: 'active',
      tanggal_akad: date,
    });

    // 2. Create Journal (Accounting)
    // Find Accounts
    const accountKas = await Estimation.findOne({ nomor_akun: '111' }); // Kas
    const accountPiutang = await Estimation.findOne({ nomor_akun: '113' }); // Piutang Mitra (was 112, fixed to 113)

    if (!accountKas || !accountPiutang) {
      throw new Error('Akun COA Kas (111) atau Piutang Mitra (113) tidak ditemukan. Silakan jalankan seeding.');
    }

    // Transaction: Kredit Kas (Uang keluar), Debit Piutang (Aset bertambah)
    const journal_no = `JU-${yyyy}${mm}${dd}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await Journal.create({
      nomor_transaksi: journal_no,
      tanggal: new Date(),
      debit_account_id: accountPiutang._id,
      credit_account_id: accountKas._id,
      amount: jumlah,
      description: `Penyaluran Pinjaman - Loan #${loan._id}`,
      reference: loan._id.toString(),
    });

    revalidatePath('/penyaluran-pinjaman');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create loan:', error);
    return { success: false, error: error.message || 'Failed to create loan' };
  }
}

export async function getLoans() {
    await dbConnect();
    const loans = await Loan.find({})
        .populate('group_id', 'nama')
        .populate('fund_source_id', 'name')
        .sort({ nomor_transaksi: -1, tanggal_akad: -1 });
    return JSON.parse(JSON.stringify(loans));
}
