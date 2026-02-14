'use server';

import dbConnect from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { GroupMember } from '@/models/GroupMember';
import { revalidatePath } from 'next/cache';

export async function getGroup(id: string) {
  await dbConnect();
  const group = await Group.findById(id);
  return group ? JSON.parse(JSON.stringify(group)) : null;
}

export async function getMembers(groupId: string) {
  await dbConnect();
  const members = await GroupMember.find({ group_id: groupId }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(members));
}

export async function createMember(groupId: string, formData: FormData) {
  await dbConnect();
  
  const no_anggota = formData.get('no_anggota') as string;
  const nama = formData.get('nama') as string;
  const jabatan = formData.get('jabatan') as string;
  const jenis_kelamin = formData.get('jenis_kelamin') as string;
  const tanggal_lahir = formData.get('tanggal_lahir') as string;
  const alamat = formData.get('alamat') as string;
  const no_telp = formData.get('no_telp') as string;

  // Validate required fields
  if (!no_anggota || !nama || !jabatan || !jenis_kelamin || !tanggal_lahir || !alamat || !no_telp) {
    return { success: false, error: 'Semua field harus diisi' };
  }

  // Validate date format
  if (isNaN(Date.parse(tanggal_lahir))) {
    return { success: false, error: 'Format tanggal lahir tidak valid' };
  }

  try {
    await GroupMember.create({
      group_id: groupId,
      no_anggota,
      nama,
      jabatan,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      no_telp,
    });
    
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create member:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMember(id: string, groupId: string, formData: FormData) {
  await dbConnect();
  
  const no_anggota = formData.get('no_anggota') as string;
  const nama = formData.get('nama') as string;
  const jabatan = formData.get('jabatan') as string;
  const jenis_kelamin = formData.get('jenis_kelamin') as string;
  const tanggal_lahir = formData.get('tanggal_lahir') as string;
  const alamat = formData.get('alamat') as string;
  const no_telp = formData.get('no_telp') as string;

  // Validate required fields
  if (!no_anggota || !nama || !jabatan || !jenis_kelamin || !tanggal_lahir || !alamat || !no_telp) {
    return { success: false, error: 'Semua field harus diisi' };
  }

  // Validate date format
  if (isNaN(Date.parse(tanggal_lahir))) {
    return { success: false, error: 'Format tanggal lahir tidak valid' };
  }

  try {
    await GroupMember.findByIdAndUpdate(id, {
      no_anggota,
      nama,
      jabatan,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      no_telp,
    });
    
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update member:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMember(id: string, groupId: string) {
  await dbConnect();
  try {
    await GroupMember.findByIdAndDelete(id);
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete member:', error);
    return { success: false, error: error.message };
  }
}
