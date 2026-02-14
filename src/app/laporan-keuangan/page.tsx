import Link from 'next/link';
import { FileText, PieChart, TrendingUp, Book, Scale } from 'lucide-react';
import { getProfile } from '../setting/profil/actions';
import FormHeader from '@/components/FormHeader';

export const dynamic = 'force-dynamic';

export default async function LaporanKeuanganPage() {
  const profile = await getProfile();

  return (
    <div>
      <FormHeader title="Laporan Keuangan" profile={profile} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Link href="/laporan-keuangan/posisi-keuangan" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-green-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <FileText className="w-8 h-8 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Posisi Keuangan</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan aset, kewajiban, dan saldo dana (Neraca).
            </p>
          </div>
        </Link>

        <Link href="/laporan-keuangan/perubahan-aset" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-blue-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
              <PieChart className="w-8 h-8 text-blue-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Perubahan Aset Kelolaan</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan mutasi dana zakat, infak, sedekah, dan dana lainnya.
            </p>
          </div>
        </Link>

        <Link href="/laporan-keuangan/perubahan-dana" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-purple-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
              <TrendingUp className="w-8 h-8 text-purple-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Perubahan Dana</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan arus penerimaan dan penyaluran dana zakat, infak, dan amil.
            </p>
          </div>
        </Link>

        <Link href="/laporan-keuangan/buku-besar" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-orange-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-orange-100 p-4 rounded-full mb-4 group-hover:bg-orange-200 transition-colors">
              <Book className="w-8 h-8 text-orange-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Buku Besar</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan rincian transaksi per akun perkiraan dalam periode tertentu.
            </p>
          </div>
        </Link>

        <Link href="/laporan-keuangan/neraca-saldo" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-teal-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-teal-100 p-4 rounded-full mb-4 group-hover:bg-teal-200 transition-colors">
              <Scale className="w-8 h-8 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Neraca Saldo</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan ringkasan saldo debit dan kredit seluruh akun per tanggal.
            </p>
          </div>
        </Link>

        <Link href="/laporan-keuangan/daftar-jurnal" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-gray-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
              <Book className="w-8 h-8 text-gray-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Daftar Jurnal</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan daftar jurnal dengan filter tanggal dan rincian akun.
            </p>
          </div>
        </Link>

        <Link href="/laporan-piutang" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-indigo-500 transition-all flex flex-col items-center text-center h-full">
            <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:bg-indigo-200 transition-colors">
              <FileText className="w-8 h-8 text-indigo-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Laporan Piutang</h2>
            <p className="text-gray-500 text-sm">
              Menampilkan daftar piutang, angsuran, dan saldo per kelompok.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
