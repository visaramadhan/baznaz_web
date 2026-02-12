'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Calculator, BookOpen, Settings, CreditCard, DollarSign, UserCog, ArrowDownCircle, ArrowUpCircle, PieChart } from 'lucide-react';
import clsx from 'clsx';

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

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold">BAZNAS Microfinance</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
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
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-700"></div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@baznas.id</p>
          </div>
        </div>
      </div>
    </div>
  );
}
