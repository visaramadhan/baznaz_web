import { getCashFlowData } from '../actions';
import { getProfile } from '@/app/setting/profil/actions';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function ArusKasPage() {
  const [data, profile] = await Promise.all([
    getCashFlowData(),
    getProfile()
  ]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (value: string | Date) =>
    new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Arus Kas</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-6xl mx-auto overflow-x-auto">
        <FormHeader title="LAPORAN ARUS KAS" profile={profile} />
        <p className="text-center text-sm text-gray-600 mb-8 -mt-4">
          Periode 1 Januari s.d. {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="mb-6 flex justify-between items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
          <span>Saldo Awal Kas</span>
          <span>{formatRupiah(data.saldoAwal)}</span>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="font-bold text-lg border-b-2 border-gray-800 mb-4 pb-1">PENERIMAAN</h3>
            <table className="min-w-full table-fixed divide-y divide-gray-200 border border-gray-200 text-sm">
              <colgroup>
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-auto" />
                <col className="w-52" />
                <col className="w-40" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">No. Bukti</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Keterangan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Lawan Akun</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.penerimaan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                      Belum ada data penerimaan kas.
                    </td>
                  </tr>
                ) : (
                  data.penerimaan.map((row) => (
                    <tr key={String(row._id)}>
                      <td className="px-4 py-3 border-r">{formatDate(row.tanggal)}</td>
                      <td className="px-4 py-3 border-r">{row.nomor_transaksi}</td>
                      <td className="px-4 py-3 border-r">{row.keterangan}</td>
                      <td className="px-4 py-3 border-r">{row.lawanAkun}</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(row.jumlah)}</td>
                    </tr>
                  ))
                )}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 border-r">Jumlah Penerimaan</td>
                  <td className="px-4 py-3 text-right">{formatRupiah(data.totalPenerimaan)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="font-bold text-lg border-b-2 border-gray-800 mb-4 pb-1">PENGELUARAN</h3>
            <table className="min-w-full table-fixed divide-y divide-gray-200 border border-gray-200 text-sm">
              <colgroup>
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-auto" />
                <col className="w-52" />
                <col className="w-40" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">No. Bukti</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Keterangan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-r">Lawan Akun</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.pengeluaran.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                      Belum ada data pengeluaran kas.
                    </td>
                  </tr>
                ) : (
                  data.pengeluaran.map((row) => (
                    <tr key={String(row._id)}>
                      <td className="px-4 py-3 border-r">{formatDate(row.tanggal)}</td>
                      <td className="px-4 py-3 border-r">{row.nomor_transaksi}</td>
                      <td className="px-4 py-3 border-r">{row.keterangan}</td>
                      <td className="px-4 py-3 border-r">{row.lawanAkun}</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(row.jumlah)}</td>
                    </tr>
                  ))
                )}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 border-r">Jumlah Pengeluaran</td>
                  <td className="px-4 py-3 text-right">{formatRupiah(data.totalPengeluaran)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div className="mt-8 space-y-3 border-t-2 border-gray-800 pt-4">
          <div className="flex justify-between font-semibold text-gray-800">
            <span>Saldo Kas Akhir</span>
            <span>{formatRupiah(data.saldoAkhir)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-800">
            <span>Kas pada Laporan Posisi Keuangan</span>
            <span>{formatRupiah(data.saldoKasPosisiKeuangan)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900">
            <span>Selisih</span>
            <span>{formatRupiah(data.saldoAkhir - data.saldoKasPosisiKeuangan)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
