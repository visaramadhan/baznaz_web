'use client';

import { useRef } from 'react';
import { saveTransactionSetting } from './actions';

interface Account {
  _id: string;
  nomor_akun: string;
  nama: string;
}

interface SettingItemProps {
  title: string;
  type: string;
  accounts: Account[];
  currentSetting?: {
    debit_account_id: Account;
    credit_account_id: Account;
  };
}

export default function SettingItem({ title, type, accounts, currentSetting }: SettingItemProps) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    formData.append('type', type);
    const result = await saveTransactionSetting(formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Setting berhasil disimpan');
    } else {
      alert('Gagal menyimpan setting: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      
      <form ref={formRef} action={clientAction} className="grid grid-cols-1 gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-2 text-sm font-medium text-gray-700 uppercase">Debet</label>
          <div className="md:col-span-10">
            <select name="debit_account" required className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50">
              <option value="">Pilih</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id} selected={currentSetting?.debit_account_id?._id === acc._id}>
                  {acc.nomor_akun} - {acc.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-2 text-sm font-medium text-gray-700 uppercase">Kredit</label>
          <div className="md:col-span-10">
            <select name="credit_account" required className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50">
              <option value="">Pilih</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id} selected={currentSetting?.credit_account_id?._id === acc._id}>
                  {acc.nomor_akun} - {acc.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors">
            Simpan
          </button>
        </div>
      </form>

      {/* Result Table */}
      {currentSetting && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-12">No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-32">Uraian</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-32">Kode Anggaran</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Anggaran</th>
              </tr>
            </thead>
            <tbody className="bg-blue-50 divide-y divide-gray-200">
              {/* Credit Row (as per screenshot example, typically Credit is source? Wait. Screenshot shows: 
                  1. Kredit 112 Kas
                  2. Debet 113 Pinjaman
                  Usually in accounting Debet is first. But the screenshot has "1. Kredit ... 2. Debet".
                  Wait, let's look closer at the screenshot.
                  "Penyaluran Dana Baznas RI"
                  Row 1: Kredit, 112, Kas di Bank Nagari
                  Row 2: Debet, 113, Pinjaman Qardh
                  This makes sense: Money goes OUT of Bank (Credit Asset) and INTO Loan (Debit Asset/Expense).
                  
                  "Penyaluran Dana Bergulir"
                  Row 1: Kredit, 112, Kas...
                  Row 2: Debet, 113, Pinjaman...
                  
                  "Pembayaran Transfer Bank"
                  Row 1: Kredit, 113, Pinjaman Qardh (This is payment FROM user? If so, Loan decreases (Credit Asset) and Bank increases (Debit Asset). 
                  Wait. "Pembayaran Transfer Bank" -> usually means Receiving payment via bank? Or paying someone?
                  "Pembayaran angsuran oleh mitra" -> User input text says "pembayaran angsuran oleh mitra".
                  If mitra pays installment:
                  Cash/Bank INCREASES (Debit)
                  Loan Receivable DECREASES (Credit)
                  Screenshot shows:
                  Row 1: Kredit, 113, Pinjaman Qardh
                  Row 2: Debet, 112, Kas di Bank Nagari
                  So yes: Credit Loan, Debit Bank.
              */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Kredit</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentSetting.credit_account_id?.nomor_akun}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currentSetting.credit_account_id?.nama}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Debet</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currentSetting.debit_account_id?.nomor_akun}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currentSetting.debit_account_id?.nama}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
