'use client';

import { useState } from 'react';
import { deleteEstimation, updateEstimation } from './actions';

interface Estimation {
  _id: string;
  nomor_akun: string;
  nama: string;
  level: number;
  saldo_normal: string;
  induk_akun?: string;
}

export default function CoaList({ estimations }: { estimations: Estimation[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      const result = await deleteEstimation(id);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateEstimation(id, formData);
    if (result.success) {
      setEditingId(null);
    } else {
      alert('Gagal mengupdate: ' + result.error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Akun</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Normal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Induk</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {estimations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Belum ada data akun.
              </td>
            </tr>
          ) : (
            estimations.map((est) => (
              <tr key={est._id}>
                {editingId === est._id ? (
                  <td colSpan={6} className="px-6 py-4">
                    <form action={(formData) => handleUpdate(est._id, formData)} className="flex flex-wrap gap-2 items-center">
                      <input name="nomor_akun" defaultValue={est.nomor_akun} className="border p-1 rounded w-20" placeholder="No. Akun" required />
                      <input name="nama" defaultValue={est.nama} className="border p-1 rounded w-48" placeholder="Nama Akun" required />
                      <select name="level" defaultValue={est.level} className="border p-1 rounded w-20">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                      <select name="saldo_normal" defaultValue={est.saldo_normal} className="border p-1 rounded w-24">
                        <option value="debet">Debet</option>
                        <option value="kredit">Kredit</option>
                      </select>
                      <input name="induk_akun" defaultValue={est.induk_akun} className="border p-1 rounded w-24" placeholder="Induk" />
                      
                      <div className="flex gap-1 ml-auto">
                        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Simpan</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Batal</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{est.nomor_akun}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ paddingLeft: `${est.level * 1.5}rem` }}>
                      {est.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{est.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{est.saldo_normal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{est.induk_akun || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setEditingId(est._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(est._id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
