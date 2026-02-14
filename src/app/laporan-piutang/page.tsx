
import { getReceivableReportData } from './actions';
import { getProfile } from '@/app/setting/profil/actions';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LaporanPiutangPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const today = new Date();
  const yyyy = today.getFullYear();
  const defaultStart = new Date(yyyy, 0, 1).toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];

  const startDate = (resolved.startDate as string) || defaultStart;
  const endDate = (resolved.endDate as string) || defaultEnd;

  const [data, profile] = await Promise.all([getReceivableReportData(startDate, endDate), getProfile()]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalPinjaman = data.reduce((sum, item) => sum + item.jumlah_pinjaman, 0);
  const totalAngsuran = data.reduce((sum, item) => sum + item.jumlah_angsuran, 0);
  const totalSaldo = data.reduce((sum, item) => sum + item.saldo, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Piutang</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-6xl mx-auto overflow-x-auto print:p-0">
        <FormHeader title="LAPORAN PIUTANG" profile={profile} />
        <div className="print:hidden mb-6">
          <form method="get" className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input name="startDate" type="date" defaultValue={startDate} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm" required />
            </div>
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input name="endDate" type="date" defaultValue={endDate} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm" required />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
              Tampilkan
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-600 mb-6 -mt-2">Periode: {new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} s/d {new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r w-12">
                No.
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                No. Kelompok
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Nama Kelompok
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Jumlah Pinjaman
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Angsuran Ke-
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Jumlah Angsuran
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada data piutang.
                </td>
              </tr>
            ) : (
              data.flatMap((item: any, index: number) => ([
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r font-mono">
                    {item.no_kelompok}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                    {item.nama_kelompok}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r">
                    {formatRupiah(item.jumlah_pinjaman)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 border-r">
                    {item.angsuran_ke}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r">
                    {formatRupiah(item.jumlah_angsuran)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {formatRupiah(item.saldo)}
                  </td>
                </tr>,
                <tr key={`${item._id}-members`} className="bg-gray-50">
                  <td colSpan={7} className="px-6 py-4">
                    <details>
                      <summary className="cursor-pointer select-none">
                        <span className="inline-flex items-center bg-indigo-600 text-white text-xs font-medium px-3 py-2 rounded hover:bg-indigo-700">
                          Lihat Breakdown per anggota
                        </span>
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 text-sm">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">No. Anggota</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Nama</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Jabatan</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Pinjaman</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Angsuran</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {item.members && item.members.length > 0 ? (
                              item.members.map((m: any) => (
                                <tr key={m._id}>
                                  <td className="px-4 py-2 text-gray-700 border-r">{m.no_anggota}</td>
                                  <td className="px-4 py-2 text-gray-900 border-r">{m.nama}</td>
                                  <td className="px-4 py-2 text-gray-700 border-r">{m.jabatan}</td>
                                  <td className="px-4 py-2 text-right text-gray-900 border-r">{formatRupiah(m.pinjaman)}</td>
                                  <td className="px-4 py-2 text-right text-gray-900 border-r">{formatRupiah(m.angsuran)}</td>
                                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatRupiah(m.saldo)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-2 text-center text-gray-500">Tidak ada anggota pada kelompok ini.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </td>
                </tr>
              ]))
            )}
            {/* Grand Total Row */}
            {data.length > 0 && (
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-800">
                <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-900 border-r uppercase">
                  Total
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900 border-r">
                  {formatRupiah(totalPinjaman)}
                </td>
                <td className="px-6 py-4 border-r"></td>
                <td className="px-6 py-4 text-right text-sm text-gray-900 border-r">
                  {formatRupiah(totalAngsuran)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatRupiah(totalSaldo)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
