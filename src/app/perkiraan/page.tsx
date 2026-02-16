import { getEstimations } from './actions';
import { getProfile } from '../setting/profil/actions';
import PerkiraanManager from './PerkiraanManager';
import FormHeader from '@/components/FormHeader';

export const dynamic = 'force-dynamic';

export default async function PerkiraanPage() {
  const [estimations, profile] = await Promise.all([
    getEstimations(),
    getProfile()
  ]);

  return (
    <div>
      <FormHeader title="Formulir Perkiraan (Chart of Accounts)" profile={profile} />
      <PerkiraanManager estimations={estimations} profile={profile} />
    </div>
  );
}
