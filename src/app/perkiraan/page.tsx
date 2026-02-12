import { getEstimations } from './actions';
import { getProfile } from '../setting/profil/actions';
import CoaForm from './CoaForm';
import CoaList from './CoaList';

export const dynamic = 'force-dynamic';

export default async function PerkiraanPage() {
  const [estimations, profile] = await Promise.all([
    getEstimations(),
    getProfile()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Daftar Perkiraan (Chart of Accounts)</h1>
      
      <CoaForm profile={profile} />
      <CoaList estimations={estimations} />
    </div>
  );
}
