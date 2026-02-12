'use client';

import { useRef } from 'react';
import { createInitialJournal } from './actions';

export default function TransactionForm({ accounts }: { accounts: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createInitialJournal(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Transaksi berhasil disimpan');
    } else {
      alert('Gagal menyimpan transaksi: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-bold mb-4">Input Saldo Awal / Transaksi Penyesuaian</h2>
      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Akun Debit</label>
          <select name="debit_account" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">Pilih Akun Debit</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.nomor_akun} - {acc.nama}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Akun Kredit</label>
          <select name="credit_account" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">Pilih Akun Kredit</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.nomor_akun} - {acc.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
          <input type="number" name="amount" required min="0" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keterangan</label>
          <input type="text" name="description" placeholder="Contoh: Saldo Awal Kas" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan Transaksi
          </button>
        </div>
      </form>
    </div>
  );
}
