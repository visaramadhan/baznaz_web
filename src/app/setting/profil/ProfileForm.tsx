'use client';

import { useRef } from 'react';
import { updateProfile } from './actions';

export default function ProfileForm({ initialData }: { initialData: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await updateProfile(formData);
    if (result.success) {
      alert('Profil berhasil diperbarui');
    } else {
      alert('Gagal memperbarui profil: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-4">Edit Profil Lembaga</h2>
      <form ref={formRef} action={clientAction} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lembaga</label>
          <input type="text" name="nama" defaultValue={initialData.nama} required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat</label>
          <textarea name="alamat" defaultValue={initialData.alamat} required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
          <input type="text" name="telp" defaultValue={initialData.telp} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Logo</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
              {initialData.logo ? (
                <img src={initialData.logo} alt="Logo Saat Ini" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No Logo</span>
              )}
            </div>
            <div className="flex-1">
              <input 
                type="file" 
                name="logo" 
                accept=".png, .jpg, .jpeg"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">Upload logo baru (PNG/JPG) untuk mengganti.</p>
            </div>
          </div>
        </div>
        
        <div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
