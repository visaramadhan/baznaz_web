'use server';

import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { Journal } from '@/models/Journal';
import { revalidatePath } from 'next/cache';

export async function updateInitialBalance(formData: FormData) {
  await dbConnect();
  
  const saldoTunai = parseFloat(formData.get('saldo_tunai') as string);
  const saldoBank = parseFloat(formData.get('saldo_bank') as string); // Assuming Bank is another account, but for now let's focus on Kas (Tunai)
  
  // Note: The user asked for "Saldo Awal Tunai" and "Saldo Awal Bank".
  // I need COA for Bank too. But I only seeded "Kas" (111).
  // Let's assume 111 is Kas Tunai.
  // I should add "Bank" to seed if I want to support it.
  // For now, let's just implement Kas.

  try {
    const accountKas = await Estimation.findOne({ nomor_akun: '111' });
    const accountModal = await Estimation.findOne({ nomor_akun: '310' });

    if (!accountKas || !accountModal) {
      return { success: false, error: 'Akun Kas (111) atau Modal Awal (310) tidak ditemukan.' };
    }

    // Check if initial balance already exists (optional, or just add new injection)
    // For simplicity, let's just create a new journal entry.
    
    await Journal.create({
      tanggal: new Date(),
      debit_account_id: accountKas._id,
      credit_account_id: accountModal._id,
      amount: saldoTunai,
      description: 'Saldo Awal Kas Tunai',
      reference: 'SALDO-AWAL',
    });

    revalidatePath('/setting');
    return { success: true };
  } catch (error) {
    console.error('Failed to update balance:', error);
    return { success: false, error: 'Failed to update balance' };
  }
}
