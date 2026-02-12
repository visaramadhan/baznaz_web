'use server';

import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { Journal } from '@/models/Journal';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
  await dbConnect();
  const accounts = await Estimation.find({ level: { $gte: 3 } }).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(accounts));
}

export async function getInitialJournals() {
  await dbConnect();
  const journals = await Journal.find({ reference: 'SALDO-AWAL' })
    .sort({ tanggal: -1 })
    .populate('debit_account_id')
    .populate('credit_account_id');
  return JSON.parse(JSON.stringify(journals));
}

export async function createInitialJournal(formData: FormData) {
  await dbConnect();
  const debitId = formData.get('debit_account') as string;
  const creditId = formData.get('credit_account') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;

  try {
    await Journal.create({
      tanggal: new Date(),
      debit_account_id: debitId,
      credit_account_id: creditId,
      amount,
      description: description || 'Saldo Awal',
      reference: 'SALDO-AWAL',
    });

    revalidatePath('/setting/perkiraan-transaksi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
