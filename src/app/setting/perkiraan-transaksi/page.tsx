import { getAccounts, getTransactionSettings } from './actions';
import SettingsList from './SettingsList';

export const dynamic = 'force-dynamic';

export default async function SettingPerkiraanPage() {
  const accounts = await getAccounts();
  const settings = await getTransactionSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Setting Awal</h1>
      
      <SettingsList accounts={accounts} settings={settings} />
    </div>
  );
}
