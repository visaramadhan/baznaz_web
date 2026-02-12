import { getGroups } from './actions';
import { getProfile } from '../setting/profil/actions';
import GroupForm from './GroupForm';
import GroupList from './GroupList';

export const dynamic = 'force-dynamic';

export default async function DataKelompok() {
  const [groups, profile] = await Promise.all([
    getGroups(),
    getProfile()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Kelompok & Mitra</h1>
      
      <GroupForm profile={profile} />

      <GroupList groups={groups} />
    </div>
  );
}
