import { getDashboardStats } from './actions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Terjadi Kesalahan Koneksi</h1>
          <p className="text-red-600 mb-4">
            Gagal menghubungkan ke database. Jika Anda menggunakan MongoDB Atlas, pastikan IP Server (Vercel) sudah diizinkan (Whitelist 0.0.0.0/0).
          </p>
          <div className="bg-gray-800 text-white p-4 rounded text-left text-xs overflow-auto">
            {String(error)}
          </div>
        </div>
      </div>
    );
  }

  const { profile } = stats;

  return (
    <div>
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" className="w-20 h-20 object-contain" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
              Logo
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold text-green-800">Sistem Informasi Akuntansi BAZNAS Microfinance Desa (SIAMID)</h1>
            <h2 className="text-lg font-semibold text-gray-700">{profile.nama}</h2>
            <p className="text-gray-500">{profile.alamat}</p>
          </div>
        </div>
      </div>
      
      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Dana Program */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600">
          <h3 className="text-gray-500 text-sm font-medium">Dana Program Dari BAZNAS RI</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">Rp {stats.danaProgram.toLocaleString('id-ID')}</p>
        </div>

        {/* Pinjaman Tersalurkan */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
          <h3 className="text-gray-500 text-sm font-medium">Pinjaman Tersalurkan Ke Mitra</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">Rp {stats.pinjamanTersalurkan.toLocaleString('id-ID')}</p>
        </div>

        {/* Total Angsuran */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-600">
          <h3 className="text-gray-500 text-sm font-medium">Total Angsuran Mitra</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">Rp {stats.totalAngsuran.toLocaleString('id-ID')}</p>
        </div>

        {/* Saldo Piutang */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-600">
          <h3 className="text-gray-500 text-sm font-medium">Saldo Piutang Mitra</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">Rp {stats.saldoPiutang.toLocaleString('id-ID')}</p>
        </div>

        {/* Jumlah Kelompok */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600">
          <h3 className="text-gray-500 text-sm font-medium">Jumlah Kelompok Mitra</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">{stats.jumlahKelompok} Kelompok</p>
        </div>

        {/* Jumlah Anggota */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-600">
          <h3 className="text-gray-500 text-sm font-medium">Jumlah Anggota Kelompok Mitra</h3>
          <p className="text-2xl font-bold mt-2 text-gray-800">{stats.jumlahAnggota} Orang</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-4">Aktivitas Jurnal Terkini</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akun Debit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akun Kredit</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentJournals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                stats.recentJournals.map((j: any) => (
                  <tr key={j._id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(j.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{j.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{j.debit_account_id?.nama}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{j.credit_account_id?.nama}</td>
                    <td className="px-4 py-2 text-sm font-medium text-right text-gray-900">
                      Rp {j.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
