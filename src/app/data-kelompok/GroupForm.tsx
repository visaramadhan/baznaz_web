'use client';

import { useRef } from 'react';
import { createGroup } from './actions';
import FormHeader from '@/components/FormHeader';

export default function GroupForm({ profile }: { profile: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createGroup(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Kelompok berhasil ditambahkan');
    } else {
      alert('Gagal menambahkan kelompok: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Form Header */}
      <FormHeader title="Formulir Kelompok Mitra" profile={profile} />

      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Kelompok</label>
          <input type="text" name="nomor" required placeholder="Contoh: 001" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Kelompok</label>
          <input type="text" name="nama" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat</label>
          <input type="text" name="alamat" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">No. Telp Kelompok</label>
          <input type="text" name="no_telp" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan Data
          </button>
        </div>
      </form>
    </div>
  );
}
