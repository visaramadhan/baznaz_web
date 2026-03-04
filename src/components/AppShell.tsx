'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.push('/login');
    }
  }, [status, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="h-screen w-full bg-gray-100">{children}</main>;
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Optional: Prevent flash of protected content (though middleware should handle this)
  if (status === 'unauthenticated') {
     return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100 print:block print:h-auto print:bg-white">
      <div className="print:hidden h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto">
        {children}
      </main>
    </div>
  );
}
