'use client';

import { useState } from 'react';
import { deleteUser, updateUser } from './actions';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserList({ users }: { users: User[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      const result = await deleteUser(id);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    const result = await updateUser(id, formData);
    if (result.success) {
      setEditingId(null);
    } else {
      alert('Gagal mengupdate: ' + result.error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <h2 className="text-lg font-bold p-6 border-b">Daftar User</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Belum ada data user.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                {editingId === user._id ? (
                  <td colSpan={4} className="px-6 py-4">
                    <form action={(formData) => handleUpdate(user._id, formData)} className="flex flex-wrap gap-2 items-center">
                      <input name="name" defaultValue={user.name} className="border p-1 rounded w-32" placeholder="Nama" required />
                      <input name="email" type="email" defaultValue={user.email} className="border p-1 rounded w-48" placeholder="Email" required />
                      <select name="role" defaultValue={user.role} className="border p-1 rounded w-24">
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input name="password" type="password" className="border p-1 rounded w-32" placeholder="New Password (Optional)" />
                      
                      <div className="flex gap-1 ml-auto">
                        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Simpan</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Batal</button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setEditingId(user._id)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)} 
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
