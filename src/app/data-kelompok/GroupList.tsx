'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteGroup, updateGroup } from './actions';

interface Group {
  _id: string;
  nama: string;
  alamat: string;
  no_telp: string;
}

export default function GroupList({ groups }: { groups: Group[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus kelompok ini?')) {
      const result = await deleteGroup(id);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateGroup(id, formData);
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kelompok</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telepon</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Belum ada data kelompok.
              </td>
            </tr>
          ) : (
            groups.map((group) => (
              <tr key={group._id}>
                {editingId === group._id ? (
                  <td colSpan={4} className="px-6 py-4">
                    <form action={(formData) => handleUpdate(group._id, formData)} className="flex gap-2 items-center">
                      <input name="nama" defaultValue={group.nama} className="border p-1 rounded w-32" placeholder="Nama" required />
                      <input name="alamat" defaultValue={group.alamat} className="border p-1 rounded w-48" placeholder="Alamat" required />
                      <input name="no_telp" defaultValue={group.no_telp} className="border p-1 rounded w-32" placeholder="No. Telp" required />
                      <div className="flex gap-1">
                        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Simpan</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">Batal</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.alamat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.no_telp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/data-kelompok/${group._id}`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Anggota
                      </Link>
                      <button 
                        onClick={() => setEditingId(group._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(group._id)} 
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
