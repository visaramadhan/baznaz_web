'use server';

import dbConnect from '@/lib/mongodb';
import { Loan } from '@/models/Loan';
import { Installment } from '@/models/Installment';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

import { GroupMember } from '@/models/GroupMember';
import '@/models/Group';

export async function getActiveLoans() {
  await dbConnect();
  // Populate group to show name in dropdown
  const loans = await Loan.find({ status: 'active' }).populate('group_id', 'nama');
  return JSON.parse(JSON.stringify(loans));
}

export async function getLoanDetails(loanId: string) {
  await dbConnect();
  const loan = await Loan.findById(loanId).populate('group_id');
  if (!loan) return null;

  const members = await GroupMember.find({ group_id: loan.group_id._id });
  return {
    loan: JSON.parse(JSON.stringify(loan)),
    members: JSON.parse(JSON.stringify(members))
  };
}

export async function getInstallments() {
  await dbConnect();
  const installments = await Installment.find({})
    .populate({
      path: 'loan_id',
      populate: { path: 'group_id', select: 'nama' }
    })
    .sort({ nomor_transaksi: 1 });
  return JSON.parse(JSON.stringify(installments));
}

export async function createInstallment(formData: FormData) {
  await dbConnect();
  
  const loan_id = formData.get('loan_id') as string;
  const jenis_transaksi = formData.get('jenis_transaksi') as string;
  const jumlah_bayar = parseFloat(formData.get('jumlah_bayar') as string);
  const keterangan = formData.get('keterangan') as string;
  const nomor_transaksi = formData.get('nomor_transaksi') as string;
  const reference = (formData.get('reference_number') as string) || '';

  try {
    const date = new Date();

    // 1. Create Installment
    const installment = await Installment.create({
      nomor_transaksi,
      loan_id,
      jenis_transaksi,
      jumlah_bayar,
      tanggal_bayar: date,
      keterangan,
    });

    // 2. Create Journal (Accounting)
    // Find Accounts
    let debitAccount;
    if (jenis_transaksi === 'Tunai') {
        debitAccount = await Estimation.findOne({ nomor_akun: '111' }); // Kas
    } else {
        debitAccount = await Estimation.findOne({ nomor_akun: '112' }); // Bank (Assuming 112 is Bank)
        // If 112 doesn't exist, try to find ANY bank account or create one?
        // Let's assume 112 is Bank for now, or fallback to 111 if not strict.
        // But user specifically asked for Bank option.
    }
    
    const creditAccount = await Estimation.findOne({ nomor_akun: '113' }); // Piutang Mitra

    if (!debitAccount) {
        throw new Error(`Akun COA untuk ${jenis_transaksi} (111/112) tidak ditemukan.`);
    }
    if (!creditAccount) {
        throw new Error('Akun COA Piutang Mitra (113) tidak ditemukan.');
    }

    // Transaction: Debit Kas/Bank (Uang masuk), Kredit Piutang (Aset berkurang)
    await Journal.create({
      nomor_transaksi,
      tanggal: new Date(),
      debit_account_id: debitAccount._id,
      credit_account_id: creditAccount._id,
      amount: jumlah_bayar,
      description: `Angsuran Pinjaman - Loan #${loan_id} - ${keterangan}`,
      reference: reference || installment._id.toString(),
    });

    revalidatePath('/penerimaan-angsuran');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create installment:', error);
    return { success: false, error: error.message || 'Failed to create installment' };
  }
}
