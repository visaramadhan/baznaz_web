import Link from 'next/link';
import { UserCog, Calculator } from 'lucide-react';

export default function SettingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Setting</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/setting/profil" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-green-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <UserCog className="w-8 h-8 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Setting Profil</h2>
            <p className="text-gray-500 text-sm">
              Atur identitas lembaga, nama, alamat, telepon, dan logo aplikasi.
            </p>
          </div>
        </Link>

        <Link href="/setting/perkiraan-transaksi" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-blue-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
              <Calculator className="w-8 h-8 text-blue-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Setting Perkiraan Transaksi</h2>
            <p className="text-gray-500 text-sm">
              Atur saldo awal perkiraan dan transaksi penyesuaian (Setting Awal).
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
