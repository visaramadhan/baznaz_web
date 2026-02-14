'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

interface LedgerViewProps {
  accounts: any[];
  ledgerData: any;
  profile: any;
  initialParams: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function LedgerView({ accounts, ledgerData, profile, initialParams }: LedgerViewProps) {
  const router = useRouter();
  const [params, setParams] = useState({
    accountId: initialParams.accountId || '',
    startDate: initialParams.startDate || new Date().toISOString().split('T')[0],
    endDate: initialParams.endDate || new Date().toISOString().split('T')[0]
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams(params as any).toString();
    router.push(`/laporan-keuangan/buku-besar?${query}`);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Buku Besar</h1>
        <PrintButton />
      </div>

      {/* Filter Form - Hidden when printing */}
      <div className="bg-white p-6 rounded-lg shadow-sm print:hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Akun Perkiraan</label>
            <select
              value={params.accountId}
              onChange={(e) => setParams({ ...params, accountId: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={params.startDate}
              onChange={(e) => setParams({ ...params, startDate: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={params.endDate}
              onChange={(e) => setParams({ ...params, endDate: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Tampilkan
            </button>
          </div>
        </form>
      </div>

      {/* Report View */}
      {ledgerData ? (
        <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-5xl mx-auto print:p-0">
          <FormHeader title="LAPORAN BUKU BESAR" profile={profile} />
          
          <div className="mb-6 text-center">
            <h3 className="font-bold text-lg">{ledgerData.account.nomor_akun} - {ledgerData.account.nama}</h3>
            <p className="text-sm text-gray-600">
              Periode: {formatDate(params.startDate)} s/d {formatDate(params.endDate)}
            </p>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y-2 border-gray-800">
                <th className="py-2 px-2 text-left w-24">Tanggal</th>
                <th className="py-2 px-2 text-left w-24">No. Ref</th>
                <th className="py-2 px-2 text-left">Keterangan</th>
                <th className="py-2 px-2 text-right w-32">Debit</th>
                <th className="py-2 px-2 text-right w-32">Kredit</th>
                <th className="py-2 px-2 text-right w-32">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening Balance */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 px-2 font-medium" colSpan={3}>Saldo Awal</td>
                <td className="py-2 px-2 text-right text-gray-500">-</td>
                <td className="py-2 px-2 text-right text-gray-500">-</td>
                <td className="py-2 px-2 text-right font-bold">{formatRupiah(ledgerData.openingBalance)}</td>
              </tr>

              {/* Transactions */}
              {ledgerData.transactions.length > 0 ? (
                ledgerData.transactions.map((trx: any) => (
                  <tr key={trx._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">{new Date(trx.date).toLocaleDateString('id-ID')}</td>
                    <td className="py-2 px-2 text-xs text-gray-500">{trx.ref}</td>
                    <td className="py-2 px-2">
                      <div className="font-medium">{trx.description}</div>
                      <div className="text-xs text-gray-500">Lawan: {trx.contra_account}</div>
                    </td>
                    <td className="py-2 px-2 text-right">{trx.debit > 0 ? formatRupiah(trx.debit) : '-'}</td>
                    <td className="py-2 px-2 text-right">{trx.credit > 0 ? formatRupiah(trx.credit) : '-'}</td>
                    <td className="py-2 px-2 text-right font-medium">{formatRupiah(trx.balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500 italic">
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              )}

              {/* Footer Total */}
              <tr className="border-t-2 border-gray-800 font-bold bg-gray-50">
                <td className="py-2 px-2" colSpan={3}>Total Pergerakan & Saldo Akhir</td>
                <td className="py-2 px-2 text-right">
                  {formatRupiah(ledgerData.transactions.reduce((sum: number, t: any) => sum + t.debit, 0))}
                </td>
                <td className="py-2 px-2 text-right">
                  {formatRupiah(ledgerData.transactions.reduce((sum: number, t: any) => sum + t.credit, 0))}
                </td>
                <td className="py-2 px-2 text-right">
                  {ledgerData.transactions.length > 0 
                    ? formatRupiah(ledgerData.transactions[ledgerData.transactions.length - 1].balance)
                    : formatRupiah(ledgerData.openingBalance)
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
          Silakan pilih akun dan rentang tanggal untuk menampilkan Buku Besar
        </div>
      )}
    </div>
  );
}
