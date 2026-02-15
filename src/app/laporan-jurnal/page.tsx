import { getJournals, getAccounts } from './actions';
import { getProfile } from '../setting/profil/actions';
import JournalForm from './JournalForm';
import FormHeader from '@/components/FormHeader';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const [journals, accounts, profile] = await Promise.all([
    getJournals(),
    getAccounts(),
    getProfile()
  ]);

  return (
    <div>
      {/* Header */}
      <FormHeader title="Laporan Jurnal Umum" profile={profile} />
      
      <JournalForm accounts={accounts} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  Belum ada data jurnal.
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
                        {j.debit_account_id?.nomor_akun || '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {j.debit_account_id?.nama || '-'}
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
                        {j.credit_account_id?.nomor_akun || '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {j.credit_account_id?.nama || '-'}
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
  );
}
