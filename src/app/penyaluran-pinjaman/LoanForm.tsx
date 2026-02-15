'use client';

import { useRef, useState, useEffect } from 'react';
import { createLoan, getGroupMembers } from './actions';
import FormHeader from '@/components/FormHeader';

interface Props {
  groups: any[];
  profile: any;
}

export default function LoanForm({ groups, profile }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [amountPerMember, setAmountPerMember] = useState(3000000);
  const [duration, setDuration] = useState(40);
  const [transactionNo, setTransactionNo] = useState('');

  // Fetch Members when Group Selected
  useEffect(() => {
    if (selectedGroupId) {
      getGroupMembers(selectedGroupId).then((data) => {
        setMembers(data);
      });
    } else {
      setMembers([]);
    }
  }, [selectedGroupId]);

  async function clientAction(formData: FormData) {
    if (!transactionNo.trim()) {
      alert('Nomor transaksi wajib diisi');
      return;
    }
    formData.set('nomor_transaksi', transactionNo.trim());

    const result = await createLoan(formData);
    if (result.success) {
      formRef.current?.reset();
      setMembers([]);
      setSelectedGroupId('');
      setTransactionNo('');
      
      alert('Penyaluran pinjaman berhasil dicatat');
    } else {
      alert('Gagal mencatat pinjaman: ' + result.error);
    }
  }

  // Calculations
  const totalLoan = members.length * amountPerMember;
  const installmentPerWeek = totalLoan / duration;
  const perMemberInstallment = amountPerMember / duration;
  // Removed monthly estimate display per request

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Form Header */}
      <FormHeader title="Formulir Penyaluran Pinjaman" profile={profile} />

      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
          <label className="block text-sm font-bold text-blue-800 mb-1">Nomor Transaksi</label>
          <input 
            type="text" 
            name="nomor_transaksi" 
            placeholder="Contoh: PP 268001"
            value={transactionNo}
            onChange={(e) => setTransactionNo(e.target.value)}
            className="block w-full bg-white border-blue-300 text-blue-800 font-mono font-bold rounded-md shadow-sm focus:ring-0" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nomor Ref</label>
          <input
            type="text"
            name="reference_number"
            placeholder="Contoh: PP"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sumber Dana</label>
          <select name="sumber_dana" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="">-- Pilih Sumber Dana --</option>
            <option value="Baznas RI">Baznas RI</option>
            <option value="Dana Bergulir">Dana Bergulir</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Pilih Kelompok</label>
          <select 
            name="group_id" 
            required 
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">-- Pilih Kelompok --</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Pinjaman (Per Anggota)</label>
          <select 
            name="jumlah_per_anggota" 
            required 
            value={amountPerMember}
            onChange={(e) => setAmountPerMember(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="3000000">Rp 3.000.000</option>
            <option value="6000000">Rp 6.000.000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Jangka Waktu</label>
          <select 
            name="jangka_waktu" 
            required 
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="40">40 Minggu</option>
            <option value="50">50 Minggu</option>
          </select>
        </div>

        {/* Member List Display */}
        {members.length > 0 && (
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Daftar Anggota Kelompok</h3>
            <div className="overflow-x-auto">
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
                  {members.map((m, idx) => (
                    <tr key={m._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">{m.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">Rp {amountPerMember.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">{duration} Minggu</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">Rp {perMemberInstallment.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calculation Summary */}
        <div className="md:col-span-2 bg-green-50 p-4 rounded-md border border-green-200 mt-4">
            <h3 className="font-semibold text-green-800 mb-2">Rincian Perhitungan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-600">Total Pinjaman ({members.length} x {amountPerMember.toLocaleString('id-ID')})</p>
                    <p className="text-xl font-bold text-green-700">Rp {totalLoan.toLocaleString('id-ID')}</p>
                </div>
                <div>
                    <p className="text-gray-600">Angsuran Pokok (Mingguan)</p>
                    <p className="font-semibold">Rp {installmentPerWeek.toLocaleString('id-ID', { maximumFractionDigits: 0 })} / minggu</p>
                </div>
            </div>
        </div>
        
        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg shadow-sm">
            Simpan & Proses Penyaluran
          </button>
        </div>
      </form>
    </div>
  );
}
