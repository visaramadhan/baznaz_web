'use client';

import { useState } from 'react';
import { deleteMember, updateMember } from './actions';

interface Member {
  _id: string;
  group_id: string;
  nama: string;
  ktp: string;
  jabatan_di_kelompok: string;
}

export default function MemberList({ members, groupId }: { members: Member[], groupId: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      const result = await deleteMember(id, groupId);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateMember(id, groupId, formData);
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KTP</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Belum ada anggota dalam kelompok ini.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member._id}>
                {editingId === member._id ? (
                  <td colSpan={4} className="px-6 py-4">
                    <form action={(formData) => handleUpdate(member._id, formData)} className="flex gap-2 items-center">
                      <input name="nama" defaultValue={member.nama} className="border p-1 rounded w-40" placeholder="Nama" required />
                      <input name="ktp" defaultValue={member.ktp} className="border p-1 rounded w-32" placeholder="KTP" required />
                      <select name="jabatan_di_kelompok" defaultValue={member.jabatan_di_kelompok} className="border p-1 rounded w-32">
                        <option value="Anggota">Anggota</option>
                        <option value="Ketua">Ketua</option>
                        <option value="Sekretaris">Sekretaris</option>
                        <option value="Bendahara">Bendahara</option>
                      </select>
                      <div className="flex gap-1">
                        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Simpan</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">Batal</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.ktp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.jabatan_di_kelompok}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setEditingId(member._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(member._id)} 
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
