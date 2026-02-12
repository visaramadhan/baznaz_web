import { getActiveLoans, getInstallments } from './actions';
import { getProfile } from '../setting/profil/actions';
import InstallmentForm from './InstallmentForm';

export default async function PenerimaanAngsuranPage() {
  const [activeLoans, installments, profile] = await Promise.all([
    getActiveLoans(),
    getInstallments(),
    getProfile()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Penerimaan Angsuran</h1>
      
      <InstallmentForm activeLoans={activeLoans} profile={profile} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold p-6 border-b">Riwayat Angsuran</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Bayar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {installments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Belum ada riwayat angsuran.
                  </td>
                </tr>
              ) : (
                installments.map((inst: any) => (
                  <tr key={inst._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inst.nomor_transaksi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(inst.tanggal_bayar).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inst.loan_id?.group_id?.nama || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inst.keterangan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      Rp {inst.jumlah_bayar.toLocaleString('id-ID')}
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
