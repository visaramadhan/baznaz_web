import { getAccounts, getCashOutJournals } from './actions';
import { getProfile } from '../setting/profil/actions';
import CashOutForm from './CashOutForm';

export const dynamic = 'force-dynamic';

export default async function CashOutPage() {
  const accounts = await getAccounts();
  const journals = await getCashOutJournals();
  const profile = await getProfile();

  return (
    <div>
      <CashOutForm accounts={accounts} profile={profile} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Daftar Kas Keluar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Transaksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Perkiraan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perkiraan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debet</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Belum ada data kas keluar.
                  </td>
                </tr>
              ) : (
                journals.flatMap((j: any) => {
                  const tanggal = new Date(j.tanggal).toLocaleDateString('id-ID');
                  const ref = j.reference || '-';
                  const ket = j.description || '-';
                  return [
                    (
                      <tr key={`${j._id}-debet`}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {j.nomor_transaksi || '-'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {tanggal}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {ket}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {ref}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {j.debit_account_id ? j.debit_account_id.nomor_akun : '-'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {j.debit_account_id ? j.debit_account_id.nama : <span className="text-red-500 italic">(Akun Terhapus)</span>}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          Rp {j.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          0
                        </td>
                      </tr>
                    ),
                    (
                      <tr key={`${j._id}-kredit`}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {j.nomor_transaksi || '-'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {tanggal}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {ket}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {ref}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {j.credit_account_id ? j.credit_account_id.nomor_akun : '-'}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {j.credit_account_id ? j.credit_account_id.nama : <span className="text-red-500 italic">(Akun Terhapus)</span>}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          0
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                          Rp {j.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  ];
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
