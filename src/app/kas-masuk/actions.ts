'use server';

import dbConnect from '@/lib/mongodb';
import { Journal } from '@/models/Journal';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
  await dbConnect();
  // Hanya tampilkan akun transaksi yang diinput (sembunyikan Level 1-3)
  const accounts = await Estimation.find({ level: 4 }).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(accounts));
}

export async function getCashInJournals() {
  await dbConnect();
  
  // Find journals created via Cash In form (reference: 'Manual Cash In' or starts with KM-)
  const journals = await Journal.find({ 
    $or: [
      { reference: 'Manual Cash In' },
      { nomor_transaksi: /^KM / }
    ]
  })
    .populate('debit_account_id', 'nama nomor_akun')
    .populate('credit_account_id', 'nama nomor_akun')
    .sort({ nomor_transaksi: 1 });
    
  return JSON.parse(JSON.stringify(journals));
}

export async function createCashIn(formData: FormData) {
  await dbConnect();
  
  const cash_account_id = formData.get('cash_account_id') as string;
  const contra_account_id = formData.get('contra_account_id') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const reference = formData.get('reference_number') as string;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : new Date();
  const nomor_transaksi = formData.get('nomor_transaksi') as string;

  try {
    await Journal.create({
      nomor_transaksi,
      tanggal: date,
      debit_account_id: cash_account_id,
      credit_account_id: contra_account_id,
      amount,
      description,
      reference: reference || 'Manual Cash In',
    });

    revalidatePath('/kas-masuk');
    revalidatePath('/laporan-jurnal');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create cash in:', error);
    return { success: false, error: error.message };
  }
}
