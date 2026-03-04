'use client';

import { useState } from 'react';
import { createRole, updateRole, deleteRole } from './actions';
import { Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'data-karyawan', label: 'Data Karyawan' },
  { id: 'data-kelompok', label: 'Data Kelompok' },
  { id: 'perkiraan', label: 'Perkiraan (COA)' },
  { id: 'penyaluran-pinjaman', label: 'Penyaluran Pinjaman' },
  { id: 'penerimaan-angsuran', label: 'Penerimaan Angsuran' },
  { id: 'kas-masuk', label: 'Kas Masuk' },
  { id: 'kas-keluar', label: 'Kas Keluar' },
  { id: 'laporan-jurnal', label: 'Jurnal Umum' },
  { id: 'laporan-keuangan', label: 'Laporan Keuangan' },
  { id: 'data-user', label: 'Manajemen User' },
  { id: 'setting', label: 'Setting' },
];

export default function RoleManager({ roles }: { roles: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      const result = await deleteRole(id);
      if (!result.success) {
        alert('Gagal menghapus role: ' + result.error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          Manajemen Role & Akses
        </h1>
        <button 
          onClick={() => { setEditingRole(null); setIsFormOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Tambah Role
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hak Akses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  {role.isSystem && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">System Default</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.includes('all') ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Full Access
                      </span>
                    ) : (
                      role.permissions.map((p: string) => (
                        <span key={p} className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!role.isSystem && (
                    <button 
                      onClick={() => handleDelete(role._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
            </h2>
            <RoleForm 
              initialData={editingRole} 
              onClose={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RoleForm({ initialData, onClose }: { initialData?: any, onClose: () => void }) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialData?.permissions || []);

  const togglePermission = (id: string) => {
    if (selectedPermissions.includes('all')) {
        // If unchecking something while 'all' is selected, remove 'all' first
        setSelectedPermissions(prev => prev.filter(p => p !== 'all'));
    }

    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(prev => prev.filter(p => p !== id));
    } else {
      setSelectedPermissions(prev => [...prev, id]);
    }
  };

  const toggleAll = () => {
    if (selectedPermissions.includes('all')) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(['all']);
    }
  };

  async function clientAction(formData: FormData) {
    // Append permissions manually
    if (selectedPermissions.includes('all')) {
        formData.append('permissions', 'all');
    } else {
        selectedPermissions.forEach(p => formData.append('permissions', p));
    }

    let result;
    if (initialData) {
      result = await updateRole(initialData._id, formData);
    } else {
      result = await createRole(formData);
    }

    if (result.success) {
      alert(initialData ? 'Role berhasil diperbarui' : 'Role berhasil dibuat');
      onClose();
    } else {
      alert('Gagal menyimpan role: ' + result.error);
    }
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama Role</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={initialData?.name} 
          required 
          disabled={initialData?.isSystem}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100" 
        />
        {initialData?.isSystem && <p className="text-xs text-gray-500 mt-1">Nama role sistem tidak dapat diubah</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hak Akses Menu</label>
        
        <div className="mb-2">
            <label className="inline-flex items-center">
                <input 
                    type="checkbox" 
                    checked={selectedPermissions.includes('all')} 
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-bold text-gray-800">Full Access (Admin)</span>
            </label>
        </div>

        <div className="grid grid-cols-2 gap-2 pl-4 border-l-2 border-gray-200">
          {AVAILABLE_PERMISSIONS.map((perm) => (
            <label key={perm.id} className="inline-flex items-center">
              <input 
                type="checkbox" 
                value={perm.id}
                checked={selectedPermissions.includes('all') || selectedPermissions.includes(perm.id)}
                onChange={() => togglePermission(perm.id)}
                disabled={selectedPermissions.includes('all')}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">{perm.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
