import { getBalanceSheetData } from '../actions';
import { getProfile } from '@/app/setting/profil/actions';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PosisiKeuanganPage() {
  const [data, profile] = await Promise.all([
    getBalanceSheetData(),
    getProfile()
  ]);

  const { assets, liabilities, equity, otherIncome, totalPassiva } = data;

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
        <h1 className="text-2xl font-bold text-gray-800">Laporan Posisi Keuangan</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-5xl mx-auto">
        <FormHeader title="LAPORAN POSISI KEUANGAN" profile={profile} />
        <p className="text-center text-sm text-gray-600 mb-8 -mt-4">
          Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Assets */}
          <div>
            <h3 className="font-bold text-lg border-b-2 border-gray-800 mb-4 pb-1">AKTIVA</h3>
            
            {/* Current Assets */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Aktiva Lancar</h4>
              <table className="w-full text-sm">
                <tbody>
                  {assets.current.map((acc: any) => (
                    <tr key={acc._id}>
                      <td className="py-1 pl-2">{acc.nama}</td>
                      <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-gray-300">
                    <td className="py-2">Jumlah Aktiva Lancar</td>
                    <td className="py-2 text-right">
                      {formatRupiah(assets.current.reduce((sum: number, acc: any) => sum + acc.balance, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fixed Assets */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Aktiva Tetap</h4>
              <table className="w-full text-sm">
                <tbody>
                  {assets.fixed.map((acc: any) => (
                    <tr key={acc._id}>
                      <td className="py-1 pl-2">{acc.nama}</td>
                      <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-gray-300">
                    <td className="py-2">Jumlah Aktiva Tetap</td>
                    <td className="py-2 text-right">
                      {formatRupiah(assets.fixed.reduce((sum: number, acc: any) => sum + acc.balance, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Column: Liabilities & Equity */}
          <div>
            <h3 className="font-bold text-lg border-b-2 border-gray-800 mb-4 pb-1">PASIVA</h3>

            {/* Liabilities */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Kewajiban</h4>
              <table className="w-full text-sm">
                <tbody>
                  {liabilities.current.map((acc: any) => (
                    <tr key={acc._id}>
                      <td className="py-1 pl-2">{acc.nama}</td>
                      <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                    </tr>
                  ))}
                  {liabilities.longTerm.map((acc: any) => (
                    <tr key={acc._id}>
                      <td className="py-1 pl-2">{acc.nama}</td>
                      <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-gray-300">
                    <td className="py-2">Jumlah Kewajiban</td>
                    <td className="py-2 text-right">
                      {formatRupiah(liabilities.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Equity / Funds */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Dana Program</h4>
              <table className="w-full text-sm">
                <tbody>
                  {equity.funds.map((acc: any) => (
                    <tr key={acc._id}>
                      <td className="py-1 pl-2">{acc.nama}</td>
                      <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-gray-300">
                    <td className="py-2">Jumlah Dana Program</td>
                    <td className="py-2 text-right">
                      {formatRupiah(equity.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Other Income / Penerimaan Lain-Lain */}
            {otherIncome.accounts.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Penerimaan Lain-Lain</h4>
                <table className="w-full text-sm">
                  <tbody>
                    {otherIncome.accounts.map((acc: any) => (
                      <tr key={acc._id}>
                        <td className="py-1 pl-2">{acc.nama}</td>
                        <td className="py-1 text-right">{formatRupiah(acc.balance)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold border-t border-gray-300">
                      <td className="py-2">Jumlah Penerimaan Lain-Lain</td>
                      <td className="py-2 text-right">
                        {formatRupiah(otherIncome.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* Total Aktiva & Pasiva sejajar */}
        <div className="mt-8 border-t-2 border-gray-800 pt-2 grid grid-cols-1 md:grid-cols-2 gap-8 font-bold text-lg">
          <div className="flex justify-between">
            <span>JUMLAH AKTIVA</span>
            <span>{formatRupiah(assets.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>JUMLAH PASIVA</span>
            <span>{formatRupiah(totalPassiva)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
