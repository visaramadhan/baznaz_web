'use client';

import { useState } from 'react';
import { deleteMember, updateMember } from './actions';

interface Member {
  _id: string;
  group_id: string;
  no_anggota: string;
  nama: string;
  jabatan: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_telp: string;
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

  async function handleSubmitUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateMember(id, groupId, formData);
    if (result.success) {
      setEditingId(null);
    } else {
      alert('Gagal mengupdate: ' + result.error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Anggota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L/P</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telp</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Belum ada anggota dalam kelompok ini.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member._id}>
                {editingId === member._id ? (
                  <td colSpan={6} className="px-6 py-4">
                    <form onSubmit={(e) => handleSubmitUpdate(e, member._id)} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">No. Anggota</label>
                        <input name="no_anggota" defaultValue={member.no_anggota} className="w-full border p-1 rounded" required />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Nama</label>
                        <input name="nama" defaultValue={member.nama} className="w-full border p-1 rounded" required />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Jabatan</label>
                        <select name="jabatan" defaultValue={member.jabatan} className="w-full border p-1 rounded">
                          <option value="Anggota">Anggota</option>
                          <option value="Ketua">Ketua</option>
                          <option value="Sekretaris">Sekretaris</option>
                          <option value="Bendahara">Bendahara</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Jenis Kelamin</label>
                        <select name="jenis_kelamin" defaultValue={member.jenis_kelamin} className="w-full border p-1 rounded">
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div>
                         <label className="text-xs font-medium text-gray-500">Tgl Lahir</label>
                         <input type="date" name="tanggal_lahir" defaultValue={new Date(member.tanggal_lahir).toISOString().split('T')[0]} className="w-full border p-1 rounded" required />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">No. Telp</label>
                        <input name="no_telp" defaultValue={member.no_telp} className="w-full border p-1 rounded" required />
                      </div>
                      <div className="col-span-2">
                         <label className="text-xs font-medium text-gray-500">Alamat</label>
                         <textarea name="alamat" defaultValue={member.alamat} rows={2} className="w-full border p-1 rounded" required></textarea>
                      </div>
                      
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">Batal</button>
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Simpan Perubahan</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.no_anggota}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.jabatan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.no_telp}</td>
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
