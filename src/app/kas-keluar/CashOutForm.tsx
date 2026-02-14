'use client';

import { useState } from 'react';
import { createCashOut } from './actions';
import FormHeader from '@/components/FormHeader';

export default function CashOutForm({ accounts, profile }: { accounts: any[], profile: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cashAccounts = accounts.filter(
    (acc) =>
      typeof acc?.nomor_akun === 'string' &&
      (acc.nomor_akun.startsWith('111') || acc.nomor_akun.startsWith('112'))
  );
  
  const otherAccounts = accounts.filter((acc) => typeof acc?.nomor_akun === 'string');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    const res = await createCashOut(formData);
    
    if (!res.success) {
      setError(res.error || 'Gagal menyimpan transaksi');
    } else {
      (document.getElementById('cashOutForm') as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Header */}
      <FormHeader title="Formulir Kas Keluar" profile={profile} />

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form id="cashOutForm" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ref</label>
            <input
              type="text"
              name="reference_number"
              placeholder="Nomor Referensi (Opsional)"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Keluar Dari Akun (Kredit)</label>
             <select 
               name="cash_account_id" 
               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
               required
             >
               <option value="">-- Pilih Akun Kas/Bank --</option>
               {cashAccounts.map((acc) => (
                 <option key={acc._id} value={acc._id}>
                   {acc.nomor_akun} - {acc.nama}
                 </option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Untuk Akun (Debit)</label>
             <select 
               name="contra_account_id" 
               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
               required
             >
               <option value="">Pilih Akun...</option>
               {otherAccounts.map((acc) => (
                 <option key={acc._id} value={acc._id}>
                   {acc.nomor_akun} - {acc.nama}
                 </option>
               ))}
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
            required
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  );
}
