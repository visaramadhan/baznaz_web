'use client';

import { useRef } from 'react';
import { createInstallment } from './actions';
import FormHeader from '@/components/FormHeader';

interface Props {
  activeLoans: any[];
  profile: any;
}

export default function InstallmentForm({ activeLoans, profile }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createInstallment(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Angsuran berhasil dicatat');
    } else {
      alert('Gagal mencatat angsuran: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Form Header */}
      <FormHeader title="Formulir Penerimaan Angsuran" profile={profile} />
      
      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Pilih Pinjaman (Kelompok)</label>
          <select name="loan_id" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">-- Pilih Pinjaman --</option>
            {activeLoans.map((loan) => (
              <option key={loan._id} value={loan._id}>
                {loan.group_id?.nama} - Rp {loan.jumlah.toLocaleString('id-ID')} ({new Date(loan.tanggal_akad).toLocaleDateString('id-ID')})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Bayar (Rp)</label>
          <input type="number" name="jumlah_bayar" min="0" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Keterangan</label>
          <input type="text" name="keterangan" placeholder="Angsuran ke-..." className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        
        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan & Proses Jurnal
          </button>
        </div>
      </form>
    </div>
  );
}
