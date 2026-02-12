'use server';

import dbConnect from '@/lib/mongodb';
import { Estimation } from '@/models/Estimation';
import { revalidatePath } from 'next/cache';

export async function getEstimations() {
  await dbConnect();
  const estimations = await Estimation.find({}).sort({ nomor_akun: 1 });
  return JSON.parse(JSON.stringify(estimations));
}

export async function createEstimation(formData: FormData) {
  await dbConnect();
  
  const nomor_akun = formData.get('nomor_akun') as string;
  const nama = formData.get('nama') as string;
  const level = parseInt(formData.get('level') as string);
  const saldo_normal = formData.get('saldo_normal') as string;
  const induk_akun = formData.get('induk_akun') as string;

  try {
    await Estimation.create({
      nomor_akun,
      nama,
      level,
      saldo_normal,
      induk_akun: induk_akun || undefined,
    });
    
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create estimation:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEstimation(id: string, formData: FormData) {
  await dbConnect();
  
  const nomor_akun = formData.get('nomor_akun') as string;
  const nama = formData.get('nama') as string;
  const level = parseInt(formData.get('level') as string);
  const saldo_normal = formData.get('saldo_normal') as string;
  const induk_akun = formData.get('induk_akun') as string;

  try {
    await Estimation.findByIdAndUpdate(id, {
      nomor_akun,
      nama,
      level,
      saldo_normal,
      induk_akun: induk_akun || undefined,
    });
    
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update estimation:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEstimation(id: string) {
  await dbConnect();
  try {
    await Estimation.findByIdAndDelete(id);
    revalidatePath('/perkiraan');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
