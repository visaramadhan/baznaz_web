'use client';

import { useRef, useState, useEffect } from 'react';
import { createInstallment, getLoanDetails } from './actions';
import FormHeader from '@/components/FormHeader';

interface Props {
  activeLoans: any[];
  profile: any;
}

export default function InstallmentForm({ activeLoans, profile }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [amountDisplay, setAmountDisplay] = useState<string>('');

  function formatNumberToDisplay(n: number) {
    if (!n) return '';
    const s = Math.floor(n).toString();
    const f = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `Rp. ${f}`;
  }
  function onAmountChange(v: string) {
    const digits = v.replace(/\D/g, '');
    const num = digits ? Number(digits) : 0;
    setAmountValue(num);
    setAmountDisplay(digits ? `Rp. ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '');
  }

  useEffect(() => {
    if (selectedLoanId) {
      getLoanDetails(selectedLoanId).then((data) => {
        if (data) {
          setLoanDetails(data.loan);
          setMembers(data.members);
          const val = data.loan.angsuran_per_minggu || 0;
          setAmountValue(val);
          setAmountDisplay(formatNumberToDisplay(val));
        }
      });
    } else {
      setLoanDetails(null);
      setMembers([]);
      setAmountValue(0);
      setAmountDisplay('');
    }
  }, [selectedLoanId]);

  async function clientAction(formData: FormData) {
    const result = await createInstallment(formData);
    if (result.success) {
      formRef.current?.reset();
      setSelectedLoanId('');
      setLoanDetails(null);
      setMembers([]);
      setAmountValue(0);
      setAmountDisplay('');
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
        {/* Jenis Transaksi */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
            <select name="jenis_transaksi" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
                <option value="Tunai">Tunai</option>
                <option value="Bank">Bank</option>
            </select>
        </div>

        {/* Pilih No Transaksi Pinjaman */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">No. Transaksi Pinjaman</label>
          <select 
            name="loan_id" 
            required 
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">-- Pilih No. Transaksi --</option>
            {activeLoans.map((loan) => (
              <option key={loan._id} value={loan._id}>
                {loan.nomor_transaksi} - {loan.group_id?.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Info Kelompok & Anggota */}
        {loanDetails && (
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="font-semibold text-blue-800">Daftar Anggota Kelompok</p>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Pinjaman</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Lama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Angsuran</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {members.map((m, idx) => {
                    const loanPerMember = loanDetails?.jumlah_per_anggota || 0;
                    const duration = loanDetails?.jangka_waktu || 1;
                    const perMember = duration ? Math.floor(loanPerMember / duration) : 0;
                    return (
                      <tr key={m._id}>
                        <td className="px-6 py-3 text-sm text-blue-800">{idx + 1}</td>
                        <td className="px-6 py-3 text-sm text-blue-800">{m.nama}</td>
                        <td className="px-6 py-3 text-sm text-blue-800">
                          Rp {loanPerMember.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-sm text-blue-800">
                          {duration} Minggu
                        </td>
                        <td className="px-6 py-3 text-sm text-blue-800">
                          Rp {perMember.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jumlah Bayar */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Bayar (Rp)</label>
          <input
            type="text"
            name="jumlah_bayar_display"
            placeholder="Rp. 0"
            value={amountDisplay}
            onChange={(e) => onAmountChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
          <input type="hidden" name="jumlah_bayar" value={amountValue} />
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
