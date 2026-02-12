'use client';

import { useRef } from 'react';
import { createEstimation } from './actions';
import FormHeader from '@/components/FormHeader';

export default function CoaForm({ profile }: { profile: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createEstimation(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Akun berhasil ditambahkan');
    } else {
      alert('Gagal menambahkan akun: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Form Header */}
      <FormHeader title="Formulir Nama Perkiraan" profile={profile} />

      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Akun</label>
          <input type="text" name="nomor_akun" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Akun</label>
          <input type="text" name="nama" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <select name="level" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="1">Level 1 (Utama)</option>
            <option value="2">Level 2 (Sub)</option>
            <option value="3">Level 3 (Detail)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Saldo Normal</label>
          <select name="saldo_normal" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="debet">Debet</option>
            <option value="kredit">Kredit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Induk Akun (Opsional)</label>
          <input type="text" name="induk_akun" placeholder="Nomor akun induk" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan Akun
          </button>
        </div>
      </form>
    </div>
  );
}
