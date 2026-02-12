'use server';

import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getUsers() {
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function createUser(formData: FormData) {
  await dbConnect();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    const hashedPassword = hashPassword(password);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    revalidatePath('/data-user');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, formData: FormData) {
  await dbConnect();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = hashPassword(password);
    }

    await User.findByIdAndUpdate(id, updateData);
    revalidatePath('/data-user');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  await dbConnect();
  try {
    await User.findByIdAndDelete(id);
    revalidatePath('/data-user');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
