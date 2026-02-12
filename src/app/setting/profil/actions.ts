'use server';

import dbConnect from '@/lib/mongodb';
import { Profile } from '@/models/Profile';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function getProfile() {
  await dbConnect();
  let profile = await Profile.findOne({});
  if (!profile) {
    profile = await Profile.create({
      nama: 'BAZNAS Microfinance Desa',
      alamat: 'Kota Bukittinggi',
      telp: '',
      logo: ''
    });
  }
  return JSON.parse(JSON.stringify(profile));
}

export async function updateProfile(formData: FormData) {
  await dbConnect();
  const nama = formData.get('nama') as string;
  const alamat = formData.get('alamat') as string;
  const telp = formData.get('telp') as string;
  const file = formData.get('logo') as File;

  try {
    let profile = await Profile.findOne({});
    if (!profile) {
      profile = new Profile({ nama, alamat, telp });
    } else {
      profile.nama = nama;
      profile.alamat = alamat;
      profile.telp = telp;
    }

    if (file && file.size > 0) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Hanya file PNG dan JPG yang diperbolehkan');
      }

      // Create unique filename
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `logo-${Date.now()}.${file.name.split('.').pop()}`;
      const path = join(process.cwd(), 'public/uploads', filename);

      // Save file
      await writeFile(path, buffer);
      
      // Update database path
      profile.logo = `/uploads/${filename}`;
    } else if (formData.get('logo_url')) {
       // If hidden input has value (existing logo) and no new file, keep it
       // Actually, we don't need to do anything if no new file is uploaded, 
       // unless we want to allow clearing the logo.
       // For now, if no file is uploaded, we just keep the old one.
    }

    await profile.save();
    
    revalidatePath('/'); // Update dashboard
    revalidatePath('/setting/profil');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
