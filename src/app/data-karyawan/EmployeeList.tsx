'use client';

import { useState } from 'react';
import { deleteEmployee, updateEmployee } from './actions';

interface Employee {
  _id: string;
  nip: string;
  name: string;
  jabatan: string;
  mulai_bekerja: string;
  email?: string;
}

export default function EmployeeList({ employees }: { employees: Employee[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const result = await deleteEmployee(id);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateEmployee(id, formData);
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mulai Bekerja</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Belum ada data karyawan.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp._id}>
                {editingId === emp._id ? (
                  <td colSpan={6} className="px-6 py-4">
                    <form action={(formData) => handleUpdate(emp._id, formData)} className="flex flex-wrap gap-2 items-center">
                      <input name="nip" defaultValue={emp.nip} className="border p-1 rounded w-20" placeholder="NIP" required />
                      <input name="name" defaultValue={emp.name} className="border p-1 rounded w-32" placeholder="Nama" required />
                      <select name="jabatan" defaultValue={emp.jabatan} className="border p-1 rounded w-28" required>
                        <option value="Manager">Manager</option>
                        <option value="Keuangan">Keuangan</option>
                        <option value="Operasional">Operasional</option>
                      </select>
                      <input name="email" defaultValue={emp.email} className="border p-1 rounded w-32" placeholder="Email" />
                      <input 
                        name="mulai_bekerja" 
                        type="date" 
                        defaultValue={new Date(emp.mulai_bekerja).toISOString().split('T')[0]} 
                        className="border p-1 rounded w-32" 
                        required 
                      />
                      <input name="tanggal_lahir" type="date" className="border p-1 rounded w-36" placeholder="Tanggal Lahir" />
                      <input name="pendidikan" className="border p-1 rounded w-32" placeholder="Pendidikan" />
                      <input name="alamat" className="border p-1 rounded w-48" placeholder="Alamat" />
                      <input name="no_hp" className="border p-1 rounded w-32" placeholder="No. HP" />
                      <div className="flex gap-1 ml-auto">
                        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Simpan</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Batal</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.nip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.jabatan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(emp.mulai_bekerja).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setEditingId(emp._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(emp._id)} 
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
