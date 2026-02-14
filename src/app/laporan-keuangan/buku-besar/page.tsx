import { getAllAccounts, getGeneralLedgerData } from '../actions';
import LedgerView from './LedgerView';
import { getProfile } from '@/app/setting/profil/actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BukuBesarPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const accounts = await getAllAccounts();
  const profile = await getProfile();
  
  let ledgerData = null;
  const accountId = resolvedSearchParams.accountId as string;
  const startDate = resolvedSearchParams.startDate as string;
  const endDate = resolvedSearchParams.endDate as string;

  if (accountId && startDate && endDate) {
    try {
      ledgerData = await getGeneralLedgerData(accountId, startDate, endDate);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    }
  }

  return (
    <LedgerView 
      accounts={accounts} 
      ledgerData={ledgerData} 
      profile={profile}
      initialParams={{ accountId, startDate, endDate }}
    />
  );
}
