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
  
  const nama = formData.get('nama') as string;
  const ktp = formData.get('ktp') as string;
  const jabatan_di_kelompok = formData.get('jabatan_di_kelompok') as string;

  try {
    await GroupMember.create({
      group_id: groupId,
      nama,
      ktp,
      jabatan_di_kelompok,
    });
    
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create member:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function updateMember(id: string, groupId: string, formData: FormData) {
  await dbConnect();
  
  const nama = formData.get('nama') as string;
  const ktp = formData.get('ktp') as string;
  const jabatan_di_kelompok = formData.get('jabatan_di_kelompok') as string;

  try {
    await GroupMember.findByIdAndUpdate(id, {
      nama,
      ktp,
      jabatan_di_kelompok,
    });
    
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteMember(id: string, groupId: string) {
  await dbConnect();
  try {
    await GroupMember.findByIdAndDelete(id);
    revalidatePath(`/data-kelompok/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}
