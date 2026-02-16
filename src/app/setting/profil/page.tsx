import { getProfile } from './actions';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function SettingProfilPage() {
  const profile = await getProfile();

  return (
    <div>
      <ProfileForm initialData={profile} />
    </div>
  );
}
