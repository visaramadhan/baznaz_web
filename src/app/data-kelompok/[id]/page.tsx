import { getGroup, getMembers } from './actions';
import MemberForm from './MemberForm';
import MemberList from './MemberList';
import Link from 'next/link';

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroup(id);
  const members = await getMembers(id);

  if (!group) {
    return <div>Kelompok tidak ditemukan</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/data-kelompok" className="text-gray-500 hover:text-gray-700">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold">Detail Kelompok: {group.nama}</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Informasi Kelompok</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium">{group.alamat}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">No. Telepon</p>
            <p className="font-medium">{group.no_telp}</p>
          </div>
        </div>
      </div>
      
      <MemberForm groupId={id} />

      <h2 className="text-xl font-bold mb-4">Daftar Anggota</h2>
      <MemberList members={members} groupId={id} />
    </div>
  );
}
