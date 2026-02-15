'use client';

import { useState } from 'react';
import { createJournal } from './actions';

export default function JournalForm({ accounts }: { accounts: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountValue, setAmountValue] = useState(0);
  function onAmountChange(v: string) {
    const digits = v.replace(/\D/g, '');
    const num = digits ? Number(digits) : 0;
    setAmountValue(num);
    setAmountDisplay(digits ? `Rp. ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '');
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    const res = await createJournal(formData);
    
    if (!res.success) {
      setError(res.error || 'Gagal menyimpan jurnal');
    } else {
      (document.getElementById('journalForm') as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Formulir Jurnal Umum</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form id="journalForm" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referensi (Opsional)</label>
            <input
              type="text"
              name="reference"
              placeholder="Contoh: Bukti No. 123"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Akun Debit</label>
             <select 
               name="debit_account_id" 
               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
               required
             >
               <option value="">Pilih Akun...</option>
               {accounts.map((acc) => (
                 <option key={acc._id} value={acc._id}>
                   {acc.nomor_akun} - {acc.nama}
                 </option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Akun Kredit</label>
             <select 
               name="credit_account_id" 
               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
               required
             >
               <option value="">Pilih Akun...</option>
               {accounts.map((acc) => (
                 <option key={acc._id} value={acc._id}>
                   {acc.nomor_akun} - {acc.nama}
                 </option>
               ))}
             </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
            <input
              type="text"
              name="amount_display"
              placeholder="Rp. 0"
              value={amountDisplay}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
            <input type="hidden" name="amount" value={amountValue} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
          </button>
        </div>
      </form>
    </div>
  );
}
