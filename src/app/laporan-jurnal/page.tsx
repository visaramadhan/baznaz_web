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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referensi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akun Kredit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {journals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Belum ada data jurnal.
                </td>
              </tr>
            ) : (
              journals.map((j: any) => (
                <tr key={j._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {j.nomor_transaksi || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(j.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {j.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                    {j.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {j.debit_account_id?.nomor_akun} - {j.debit_account_id?.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {j.credit_account_id?.nomor_akun} - {j.credit_account_id?.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    Rp {j.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
