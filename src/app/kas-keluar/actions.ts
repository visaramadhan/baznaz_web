'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
  await dbConnect();
  // Get all accounts (removed level restriction to ensure all potential transaction accounts are available)
  const accounts = await Estimation.find({}).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(accounts));
}

export async function getCashOutJournals() {
  await dbConnect();
  
  // Find journals created via Cash Out form (reference: 'Manual Cash Out')
  const journals = await Journal.find({ reference: 'Manual Cash Out' })
    .populate('debit_account_id', 'nama nomor_akun')
    .populate('credit_account_id', 'nama nomor_akun')
    .sort({ nomor_transaksi: -1, tanggal: -1 });
    
  return JSON.parse(JSON.stringify(journals));
}

export async function createCashOut(formData: FormData) {
  await dbConnect();
  
  const cash_account_id = formData.get('cash_account_id') as string;
  const contra_account_id = formData.get('contra_account_id') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  try {
     // Generate Transaction Number
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const nomor_transaksi = `KK-${yyyy}${mm}${dd}-${random}`;

    // Cash Out: Credit Cash (Asset Decrease), Debit Expense/Asset (Asset Increase/Expense Increase)
    await Journal.create({
      nomor_transaksi,
      tanggal: date,
      debit_account_id: contra_account_id,
      credit_account_id: cash_account_id,
      amount,
      description,
      reference: 'Manual Cash Out',
    });

    revalidatePath('/kas-keluar');
    revalidatePath('/laporan-jurnal');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create cash out:', error);
    return { success: false, error: error.message };
  }
}
