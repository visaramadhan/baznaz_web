import Image from 'next/image';

interface Profile {
  nama: string;
  alamat: string;
  telp: string;
  logo?: string;
}

interface FormHeaderProps {
  title: string;
  profile: Profile;
}

export default function FormHeader({ title, profile }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b pb-4 mb-4">
      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
        {profile.logo ? (
          <img 
            src={profile.logo} 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-400">No Logo</span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <h3 className="text-sm font-semibold text-gray-700">{profile.nama}</h3>
        <p className="text-xs text-gray-500">{profile.alamat}</p>
        {profile.telp && <p className="text-xs text-gray-500">Telp: {profile.telp}</p>}
      </div>
    </div>
  );
}
