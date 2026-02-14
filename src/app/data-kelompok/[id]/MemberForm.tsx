'use client';

import { useRef } from 'react';
import { createMember } from './actions';

export default function MemberForm({ groupId }: { groupId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function clientAction(formData: FormData) {
    const result = await createMember(groupId, formData);
    if (result.success) {
      formRef.current?.reset();
      alert('Anggota berhasil ditambahkan');
    } else {
      alert('Gagal menambahkan anggota: ' + result.error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-bold mb-4">Tambah Anggota</h2>
      <form ref={formRef} action={clientAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">No. Anggota</label>
          <input type="text" name="no_anggota" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Anggota</label>
          <input type="text" name="nama" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jabatan</label>
          <select name="jabatan" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="Anggota">Anggota</option>
            <option value="Ketua">Ketua</option>
            <option value="Sekretaris">Sekretaris</option>
            <option value="Bendahara">Bendahara</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
          <select name="jenis_kelamin" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500">
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
          <input type="date" name="tanggal_lahir" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">No. Telp</label>
          <input type="text" name="no_telp" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Alamat</label>
          <textarea name="alamat" required rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"></textarea>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Simpan Anggota
          </button>
        </div>
      </form>
    </div>
  );
}
