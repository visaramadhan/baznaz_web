'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Installment } from '@/models/Installment';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

export async function getActiveLoans() {
  await dbConnect();
  // Populate group to show name in dropdown
  const loans = await Loan.find({ status: 'active' }).populate('group_id', 'nama');
  return JSON.parse(JSON.stringify(loans));
}

export async function getInstallments() {
  await dbConnect();
  const installments = await Installment.find({})
    .populate({
      path: 'loan_id',
      populate: { path: 'group_id', select: 'nama' }
    })
    .sort({ nomor_transaksi: -1, tanggal_bayar: -1 });
  return JSON.parse(JSON.stringify(installments));
}

export async function createInstallment(formData: FormData) {
  await dbConnect();
  
  const loan_id = formData.get('loan_id') as string;
  const jumlah_bayar = parseFloat(formData.get('jumlah_bayar') as string);
  const keterangan = formData.get('keterangan') as string;

  try {
    // Generate Nomor Transaksi
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const nomor_transaksi = `AG-${yyyy}${mm}${dd}-${random}`;

    // 1. Create Installment
    const installment = await Installment.create({
      nomor_transaksi,
      loan_id,
      jumlah_bayar,
      tanggal_bayar: date,
      keterangan,
    });

    // 2. Create Journal (Accounting)
    // Find Accounts
    const accountKas = await Estimation.findOne({ nomor_akun: '111' }); // Kas
    const accountPiutang = await Estimation.findOne({ nomor_akun: '113' }); // Piutang Mitra (was 112, fixed to 113)

    if (!accountKas || !accountPiutang) {
      throw new Error('Akun COA Kas (111) atau Piutang Mitra (113) tidak ditemukan.');
    }

    // Transaction: Debit Kas (Uang masuk), Kredit Piutang (Aset berkurang)
    const journal_no = `JU-${yyyy}${mm}${dd}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await Journal.create({
      nomor_transaksi: journal_no,
      tanggal: new Date(),
      debit_account_id: accountKas._id,
      credit_account_id: accountPiutang._id,
      amount: jumlah_bayar,
      description: `Angsuran Pinjaman - Loan #${loan_id} - ${keterangan}`,
      reference: installment._id.toString(),
    });

    revalidatePath('/penerimaan-angsuran');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create installment:', error);
    return { success: false, error: error.message || 'Failed to create installment' };
  }
}
