import { getFundChangesData } from '../actions';
import { getProfile } from '@/app/setting/profil/actions';
import FormHeader from '@/components/FormHeader';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PerubahanDanaPage() {
  const [funds, profile] = await Promise.all([
    getFundChangesData(),
    getProfile()
  ]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const sections = [
    { key: 'zakat', title: 'DANA ZAKAT' },
    { key: 'infak', title: 'DANA INFAK / SEDEKAH' },
    { key: 'amil', title: 'DANA AMIL' },
    { key: 'nonhalal', title: 'DANA NONHALAL' },
  ];

  const totalSurplus = Object.values(funds).reduce((sum: number, f: any) => sum + f.surplus, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Perubahan Dana</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none max-w-5xl mx-auto print:p-0">
        <FormHeader title="LAPORAN PERUBAHAN DANA" profile={profile} />
        <p className="text-center text-sm text-gray-600 mb-8 -mt-4">
          Periode: {new Date().getFullYear()}
        </p>

        <div className="space-y-8">
          {sections.map((section) => {
            const data = funds[section.key];
            if (!data) return null;

            return (
              <div key={section.key} className="break-inside-avoid">
                <h3 className="font-bold text-lg border-b-2 border-gray-800 mb-4 pb-1 uppercase">{section.title}</h3>
                
                {/* Penerimaan */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2 ml-2">Penerimaan</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      {data.revenues.length > 0 ? (
                        data.revenues.map((acc: any) => (
                          <tr key={acc._id}>
                            <td className="py-1 pl-6">{acc.nama}</td>
                            <td className="py-1 text-right w-48">{formatRupiah(acc.balance)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-1 pl-6 italic text-gray-500">- Tidak ada transaksi -</td>
                          <td className="py-1 text-right w-48">{formatRupiah(0)}</td>
                        </tr>
                      )}
                      <tr className="font-semibold">
                        <td className="py-2 pl-4">Jumlah Penerimaan</td>
                        <td className="py-2 text-right border-t border-gray-300">
                          {formatRupiah(data.revenues.reduce((s: number, a: any) => s + a.balance, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Penyaluran */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2 ml-2">Penyaluran</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      {data.expenses.length > 0 ? (
                        data.expenses.map((acc: any) => (
                          <tr key={acc._id}>
                            <td className="py-1 pl-6">{acc.nama}</td>
                            <td className="py-1 text-right w-48">{formatRupiah(acc.balance)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-1 pl-6 italic text-gray-500">- Tidak ada transaksi -</td>
                          <td className="py-1 text-right w-48">{formatRupiah(0)}</td>
                        </tr>
                      )}
                      <tr className="font-semibold">
                        <td className="py-2 pl-4">Jumlah Penyaluran</td>
                        <td className="py-2 text-right border-t border-gray-300">
                          {formatRupiah(data.expenses.reduce((s: number, a: any) => s + a.balance, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Surplus/Deficit per Fund */}
                <div className="bg-gray-50 p-2 rounded flex justify-between font-bold border border-gray-200">
                  <span>Surplus / (Defisit) {section.title}</span>
                  <span>{formatRupiah(data.surplus)}</span>
                </div>
              </div>
            );
          })}

          {/* Grand Total */}
          <div className="mt-8 border-t-2 border-gray-800 pt-4 flex justify-between font-bold text-xl">
            <span>JUMLAH SURPLUS / (DEFISIT) TAHUN BERJALAN</span>
            <span>{formatRupiah(totalSurplus)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
