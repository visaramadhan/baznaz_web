import { getAssetChangesData } from '../actions';
import { getProfile } from '@/app/setting/profil/actions';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PerubahanAsetPage() {
  const [data, profile] = await Promise.all([
    getAssetChangesData(),
    getProfile()
  ]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Perubahan Aset Kelolaan</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-6xl mx-auto overflow-x-auto">
        <FormHeader title="LAPORAN PERUBAHAN ASET KELOLAAN" profile={profile} />
        <p className="text-center text-sm text-gray-600 mb-8 -mt-4">
          Periode 1 Januari s.d. {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Keterangan Dana
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Saldo Awal
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Penambahan
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Pengurangan
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Akhir
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada data dana kelolaan (Akun dengan awalan '3').
                </td>
              </tr>
            ) : (
              data.map((row: any) => (
                <tr key={row._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                    {row.nama} <span className="text-xs text-gray-500 font-normal">({row.nomor_akun})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 border-r">
                    {formatRupiah(row.saldoAwal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 border-r">
                    {formatRupiah(row.penambahan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 border-r">
                    ({formatRupiah(row.pengurangan)})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {formatRupiah(row.saldoAkhir)}
                  </td>
                </tr>
              ))
            )}
            
            {/* Totals Row */}
            {data.length > 0 && (
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-sm text-gray-900 border-r">TOTAL</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 border-r">
                  {formatRupiah(data.reduce((sum: number, r: any) => sum + r.saldoAwal, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right text-green-700 border-r">
                  {formatRupiah(data.reduce((sum: number, r: any) => sum + r.penambahan, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right text-red-700 border-r">
                  ({formatRupiah(data.reduce((sum: number, r: any) => sum + r.pengurangan, 0))})
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatRupiah(data.reduce((sum: number, r: any) => sum + r.saldoAkhir, 0))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
