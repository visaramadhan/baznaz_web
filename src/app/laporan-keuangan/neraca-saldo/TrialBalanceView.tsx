'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

interface TrialBalanceViewProps {
  data: any;
  profile: any;
  initialParams: { startDate: string, endDate: string };
}

export default function TrialBalanceView({ data, profile, initialParams }: TrialBalanceViewProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialParams.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialParams.endDate || new Date().toISOString().split('T')[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/laporan-keuangan/neraca-saldo?startDate=${startDate}&endDate=${endDate}`);
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
        <h1 className="text-2xl font-bold text-gray-800">Neraca Saldo</h1>
        <PrintButton />
      </div>

      {/* Filter Form - Hidden when printing */}
      <div className="bg-white p-6 rounded-lg shadow-sm print:hidden">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Tampilkan
          </button>
        </form>
      </div>

      {/* Report View */}
      {data ? (
        <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-5xl mx-auto print:p-0">
          <FormHeader title="NERACA SALDO" profile={profile} />
          <p className="text-center text-sm text-gray-600 mb-8 -mt-4">
            Periode: {formatDate(startDate)} s/d {formatDate(endDate)}
          </p>

          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  No.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  No. Perkiraan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  Nama Perkiraan
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  Normal
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  Debit (Rp)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kredit (Rp)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.accounts.map((acc: any, index: number) => (
                <tr key={acc._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r">
                    {acc.nomor_akun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r">
                    {acc.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r uppercase">
                    {acc.saldo_normal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r">
                    {acc.debit > 0 ? formatRupiah(acc.debit) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {acc.credit > 0 ? formatRupiah(acc.credit) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right border-r">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r">
                  {formatRupiah(data.totalDebit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatRupiah(data.totalCredit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
          Silakan pilih rentang tanggal untuk menampilkan Neraca Saldo
        </div>
      )}
    </div>
  );
}
