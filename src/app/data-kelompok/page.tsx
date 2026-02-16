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
      <GroupForm profile={profile} />

      <GroupList groups={groups} />
    </div>
  );
}
