import { getEstimations } from './actions';
import { getProfile } from '../setting/profil/actions';
import PerkiraanManager from './PerkiraanManager';

export const dynamic = 'force-dynamic';

export default async function PerkiraanPage() {
  const [estimations, profile] = await Promise.all([
    getEstimations(),
    getProfile()
  ]);

  return <PerkiraanManager estimations={estimations} profile={profile} />;
}