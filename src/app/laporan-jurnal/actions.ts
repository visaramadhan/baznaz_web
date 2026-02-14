'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
  await dbConnect();
  // Ambil seluruh daftar perkiraan agar opsi sesuai halaman Perkiraan
  const accounts = await Estimation.find({}).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(accounts));
}

export async function createJournal(formData: FormData) {
  await dbConnect();
  
  const debit_account_id = formData.get('debit_account_id') as string;
  const credit_account_id = formData.get('credit_account_id') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const reference = formData.get('reference') as string;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  try {
     // Generate Transaction Number
    const yy = String(date.getFullYear() % 100).padStart(2, '0');
    const nomor_transaksi = `JU ${yy}${String(Math.floor(1000 + Math.random() * 9000))}`;

    await Journal.create({
      nomor_transaksi,
      tanggal: date,
      debit_account_id,
      credit_account_id,
      amount,
      description,
      reference: reference || 'Manual Entry',
    });

    revalidatePath('/laporan-jurnal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getJournals() {
  await dbConnect();
  const journals = await Journal.find({})
    .populate('debit_account_id', 'nama nomor_akun')
    .populate('credit_account_id', 'nama nomor_akun')
    .sort({ nomor_transaksi: -1, tanggal: -1 });
  return JSON.parse(JSON.stringify(journals));
}
