import { getAccounts, getInitialJournals } from './actions';
import TransactionForm from './TransactionForm';

export default async function SettingPerkiraanPage() {
  const accounts = await getAccounts();
  const journals = await getInitialJournals();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Setting Perkiraan Transaksi (Saldo Awal)</h1>
      
      <TransactionForm accounts={accounts} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4">Riwayat Transaksi Setting</h2>
        
        {journals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada data transaksi.</p>
        ) : (
          <div className="space-y-4">
            {journals.map((journal: any) => (
              <div key={journal._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <span className="text-sm text-gray-500">{new Date(journal.tanggal).toLocaleDateString('id-ID')}</span>
                  <span className="font-medium">{journal.description}</span>
                </div>
                
                {/* Debit Line */}
                <div className="flex justify-between items-center text-gray-800 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Debet</span>
                    <span>{journal.debit_account_id?.nomor_akun} - {journal.debit_account_id?.nama}</span>
                  </div>
                  <span>Rp {journal.amount.toLocaleString('id-ID')}</span>
                </div>

                {/* Credit Line - Indented/Below */}
                <div className="flex justify-between items-center text-gray-600 mt-1 pl-8">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Kredit</span>
                    <span>{journal.credit_account_id?.nomor_akun} - {journal.credit_account_id?.nama}</span>
                  </div>
                  <span>Rp {journal.amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
