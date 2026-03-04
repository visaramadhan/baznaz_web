'use client';

import { useState } from 'react';
import { deleteUser, updateUser } from './actions';
import { Edit, Trash2, X, Check } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserList({ users, roles }: { users: User[], roles: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });

  const startEditing = (user: User) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      const result = await deleteUser(id);
      if (!result.success) {
        alert('Gagal menghapus: ' + result.error);
      }
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('email', editForm.email);
    formData.append('role', editForm.role);
    if (editForm.password) {
        formData.append('password', editForm.password);
    }

    const result = await updateUser(editingId, formData);
    if (result.success) {
      setEditingId(null);
      alert('User berhasil diperbarui');
    } else {
      alert('Gagal mengupdate: ' + result.error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-gray-800">Daftar User</h2>
      </div>
      <div className="overflow-x-auto">
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
                <tr key={user._id} className="hover:bg-gray-50">
                  {editingId === user._id ? (
                    <td colSpan={4} className="px-6 py-4">
                      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <input 
                            name="name" 
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm" 
                            placeholder="Nama" 
                            required 
                        />
                        <input 
                            name="email" 
                            type="email" 
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm" 
                            placeholder="Email" 
                            required 
                        />
                        <select 
                            name="role" 
                            value={editForm.role}
                            onChange={handleEditChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm"
                            required
                        >
                          <option value="">-- Pilih Role --</option>
                          {roles.map((role) => (
                            <option key={role._id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                        <input 
                            name="password" 
                            type="password" 
                            value={editForm.password}
                            onChange={handleEditChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm" 
                            placeholder="Password Baru (Opsional)" 
                        />
                        
                        <div className="flex gap-2 justify-end md:col-span-4">
                          <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-green-700">
                            <Check className="w-4 h-4" /> Simpan
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-gray-300">
                            <X className="w-4 h-4" /> Batal
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => startEditing(user)} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
