'use server';

import dbConnect from '@/lib/mongodb';
import { Employee } from '@/models/Employee';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  await dbConnect();
  const employees = await Employee.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(employees));
}

export async function createEmployee(formData: FormData) {
  await dbConnect();
  
  const nip = formData.get('nip') as string;
  const name = formData.get('name') as string;
  const jabatan = formData.get('jabatan') as string;
  const mulai_bekerja = formData.get('mulai_bekerja') as string;
  const email = formData.get('email') as string;

  try {
    await Employee.create({
      nip,
      name,
      jabatan,
      mulai_bekerja: new Date(mulai_bekerja),
      email,
    });
    
    revalidatePath('/data-karyawan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create employee:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEmployee(id: string) {
  await dbConnect();
  try {
    await Employee.findByIdAndDelete(id);
    revalidatePath('/data-karyawan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete employee:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  await dbConnect();
  
  const nip = formData.get('nip') as string;
  const name = formData.get('name') as string;
  const jabatan = formData.get('jabatan') as string;
  const mulai_bekerja = formData.get('mulai_bekerja') as string;
  const email = formData.get('email') as string;

  try {
    await Employee.findByIdAndUpdate(id, {
      nip,
      name,
      jabatan,
      mulai_bekerja: new Date(mulai_bekerja),
      email,
    });
    
    revalidatePath('/data-karyawan');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update employee:', error);
    return { success: false, error: error.message };
  }
}
