import { getProfile } from './actions';
import ProfileForm from './ProfileForm';

export default async function SettingProfilPage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Setting Profil</h1>
      <ProfileForm initialData={profile} />
    </div>
  );
}
