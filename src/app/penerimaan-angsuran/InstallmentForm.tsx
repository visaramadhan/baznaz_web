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
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (selectedLoanId) {
      getLoanDetails(selectedLoanId).then((data) => {
        if (data) {
          setLoanDetails(data.loan);
          setMembers(data.members);
          setAmount(data.loan.angsuran_per_minggu || 0);
        }
      });
    } else {
      setLoanDetails(null);
      setMembers([]);
      setAmount(0);
    }
  }, [selectedLoanId]);

  async function clientAction(formData: FormData) {
    const result = await createInstallment(formData);
    if (result.success) {
      formRef.current?.reset();
      setSelectedLoanId('');
      setLoanDetails(null);
      setMembers([]);
      setAmount(0);
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
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="font-semibold text-gray-800">Detail Pinjaman:</p>
                <p className="text-sm text-gray-600">Nama Kelompok: <span className="font-medium text-gray-900">{loanDetails.group_id?.nama}</span></p>
                <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Daftar Anggota:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 grid grid-cols-2 gap-1">
                        {members.map((m: any) => (
                            <li key={m._id}>{m.nama} ({m.jabatan})</li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* Jumlah Bayar (Auto-filled but editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Bayar (Rp)</label>
          <input 
            type="number" 
            name="jumlah_bayar" 
            min="0" 
            required 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" 
          />
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
