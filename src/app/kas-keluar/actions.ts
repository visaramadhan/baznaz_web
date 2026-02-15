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

export async function getCashOutJournals() {
  await dbConnect();
  
  // Find journals created via Cash Out form (reference: 'Manual Cash Out' or starts with KK-)
  // Or simply filter by having a credit to a cash account? 
  // For now, let's keep it broad or check reference
  const journals = await Journal.find({ 
    $or: [
      { reference: 'Manual Cash Out' },
      { nomor_transaksi: /^KK / }
    ]
  })
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
  const reference = formData.get('reference_number') as string;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  try {
     // Generate Transaction Number
    const yy = String(date.getFullYear() % 100).padStart(2, '0');
    const rand4 = String(Math.floor(1000 + Math.random() * 9000));
    const nomor_transaksi = `KK ${yy}${rand4}`;

    // Cash Out: Credit Cash (Asset Decrease), Debit Expense/Asset (Asset Increase/Expense Increase)
    await Journal.create({
      nomor_transaksi,
      tanggal: date,
      debit_account_id: contra_account_id,
      credit_account_id: cash_account_id,
      amount,
      description,
      reference: reference || 'Manual Cash Out',
    });

    revalidatePath('/kas-keluar');
    revalidatePath('/laporan-jurnal');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create cash out:', error);
    return { success: false, error: error.message };
  }
}
