'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Users, Briefcase, Calculator, BookOpen, Settings, CreditCard, DollarSign, UserCog, ArrowDownCircle, ArrowUpCircle, PieChart } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { getRoles } from '@/app/setting/roles/actions';

// Map menu paths to permission keys
const MENU_PERMISSION_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/data-karyawan': 'data-karyawan',
  '/data-kelompok': 'data-kelompok',
  '/perkiraan': 'perkiraan',
  '/penyaluran-pinjaman': 'penyaluran-pinjaman',
  '/penerimaan-angsuran': 'penerimaan-angsuran',
  '/kas-masuk': 'kas-masuk',
  '/kas-keluar': 'kas-keluar',
  '/laporan-jurnal': 'laporan-jurnal',
  '/laporan-keuangan': 'laporan-keuangan',
  '/data-user': 'data-user',
  '/setting': 'setting',
};

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Data Karyawan', href: '/data-karyawan', icon: Users },
  { name: 'Data Kelompok', href: '/data-kelompok', icon: Briefcase },
  { name: 'Perkiraan (COA)', href: '/perkiraan', icon: BookOpen },
  { name: 'Penyaluran Pinjaman', href: '/penyaluran-pinjaman', icon: CreditCard },
  { name: 'Penerimaan Angsuran', href: '/penerimaan-angsuran', icon: DollarSign },
  { name: 'Kas Masuk', href: '/kas-masuk', icon: ArrowDownCircle },
  { name: 'Kas Keluar', href: '/kas-keluar', icon: ArrowUpCircle },
  { name: 'Jurnal Umum', href: '/laporan-jurnal', icon: Calculator },
  { name: 'Laporan Keuangan', href: '/laporan-keuangan', icon: PieChart },
  { name: 'Manajemen User', href: '/data-user', icon: UserCog },
  { name: 'Setting', href: '/setting', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (session?.user) {
        // We can fetch permissions from an API route or server action if not in session
        // For simplicity, let's assume we fetch role details
        try {
            const userRole = (session.user as any).role;
            if (userRole) {
                // Fetch role permissions
                // Note: Ideally we should have an API for this to avoid direct DB calls in client (which is impossible)
                // or pass it via props. But since Sidebar is in Layout, let's use a server action wrapper if possible,
                // or just fetch all roles and find the matching one.
                const roles = await getRoles();
                const role = roles.find((r: any) => r.name === userRole);
                if (role) {
                    setPermissions(role.permissions);
                }
            }
        } catch (e) {
            console.error(e);
        }
      }
      setLoading(false);
    }
    fetchPermissions();
  }, [session]);

  const userRole = session?.user ? (session.user as any).role : '';
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  // Filter menu items based on permissions
  const filteredMenu = menuItems.filter(item => {
    if (loading) return false; // Hide until loaded? Or show all skeleton? Let's hide.
    if (!permissions.length) return false; // No permissions loaded yet
    
    if (permissions.includes('all')) return true; // Admin

    const requiredPermission = MENU_PERMISSION_MAP[item.href];
    return permissions.includes(requiredPermission);
  });

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">BAZNAS Microfinance</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {loading ? (
            <div className="px-4 text-slate-500 text-sm">Memuat menu...</div>
        ) : (
            <ul className="space-y-1 px-2">
            {filteredMenu.map((item) => {
                const LinkIcon = item.icon;
                return (
                <li key={item.name}>
                    <Link
                    href={item.href}
                    className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        {
                        'bg-green-600 text-white': pathname === item.href,
                        'text-slate-300 hover:bg-slate-800 hover:text-white': pathname !== item.href,
                        }
                    )}
                    >
                    <LinkIcon className="h-5 w-5" />
                    {item.name}
                    </Link>
                </li>
                );
            })}
            </ul>
        )}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
