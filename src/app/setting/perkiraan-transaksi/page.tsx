import { getAccounts, getTransactionSettings } from './actions';
import SettingsList from './SettingsList';

export const dynamic = 'force-dynamic';

export default async function SettingPerkiraanPage() {
  const accounts = await getAccounts();
  const settings = await getTransactionSettings();

  return (
    <div>
      <SettingsList accounts={accounts} settings={settings} />
    </div>
  );
}
