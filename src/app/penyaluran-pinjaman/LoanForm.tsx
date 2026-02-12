'use client';

import { useRef } from 'react';
import { createLoan } from './actions';
import FormHeader from '@/components/FormHeader';

interface Props {
  groups: any[];
  fundSources: any[];
  profile: any;
}

export default function LoanForm({ groups, fundSources, profile }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createLoan(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Penyaluran pinjaman berhasil dicatat');
    } else {
      alert('Gagal mencatat pinjaman: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Form Header */}
      <FormHeader title="Formulir Penyaluran Pinjaman" profile={profile} />

      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pilih Kelompok</label>
          <select name="group_id" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">-- Pilih Kelompok --</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sumber Dana</label>
          <select name="fund_source_id" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">-- Pilih Sumber Dana --</option>
            {fundSources.map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Pinjaman (Rp)</label>
          <input type="number" name="jumlah" min="0" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jangka Waktu (Minggu)</label>
          <input type="number" name="jangka_waktu" min="1" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Margin / Jasa (%)</label>
          <input type="number" name="margin" step="0.1" min="0" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        
        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Simpan & Proses Jurnal
          </button>
        </div>
      </form>
    </div>
  );
}
