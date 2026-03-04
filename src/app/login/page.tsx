import { getProfile } from '@/app/setting/profil/actions';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const profile = await getProfile();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center flex flex-col items-center">
          {profile?.logo ? (
            <img 
              src={profile.logo} 
              alt="Logo Baznas" 
              className="w-24 h-24 object-contain mb-4"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <span className="text-xs">No Logo</span>
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-green-700">
            {profile?.nama || 'BAZNAS Microfinance'}
          </h1>
          
          {profile?.alamat && (
            <p className="mt-2 text-sm text-gray-500">
              {profile.alamat}
            </p>
          )}
          
          {!profile && (
            <p className="mt-2 text-gray-600">Sistem Microfinance</p>
          )}
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Baznas Microfinance
        </div>
      </div>
    </div>
  );
}
