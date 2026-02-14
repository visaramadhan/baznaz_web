import { getTrialBalanceData } from '../actions';
import TrialBalanceView from './TrialBalanceView';
import { getProfile } from '@/app/setting/profil/actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NeracaSaldoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const profile = await getProfile();
  
  let data = null;
  const startDate = resolvedSearchParams.startDate as string || new Date().toISOString().split('T')[0];
  const endDate = resolvedSearchParams.endDate as string || new Date().toISOString().split('T')[0];

  try {
    data = await getTrialBalanceData(startDate, endDate);
  } catch (error) {
    console.error('Error fetching trial balance data:', error);
  }

  return (
    <TrialBalanceView 
      data={data} 
      profile={profile}
      initialParams={{ startDate, endDate }}
    />
  );
}
