'use server';

import dbConnect from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { revalidatePath } from 'next/cache';

export async function getGroups() {
  await dbConnect();
  const groups = await Group.find({}).sort({ nomor: 1 });
  return JSON.parse(JSON.stringify(groups));
}

export async function createGroup(formData: FormData) {
  await dbConnect();
  
  const nomor = formData.get('nomor') as string;
  const nama = formData.get('nama') as string;
  const alamat = formData.get('alamat') as string;
  const no_telp = formData.get('no_telp') as string;

  try {
    await Group.create({
      nomor,
      nama,
      alamat,
      no_telp,
    });
    
    revalidatePath('/data-kelompok');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create group:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGroup(id: string, formData: FormData) {
  await dbConnect();
  
  const nomor = formData.get('nomor') as string;
  const nama = formData.get('nama') as string;
  const alamat = formData.get('alamat') as string;
  const no_telp = formData.get('no_telp') as string;

  try {
    await Group.findByIdAndUpdate(id, {
      nomor,
      nama,
      alamat,
      no_telp,
    });
    
    revalidatePath('/data-kelompok');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update group:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGroup(id: string) {
  await dbConnect();
  try {
    await Group.findByIdAndDelete(id);
    revalidatePath('/data-kelompok');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete group:', error);
    return { success: false, error: error.message };
  }
}
