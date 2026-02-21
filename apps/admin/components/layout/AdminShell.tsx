'use client';

import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuthGuard } from '@/lib/guards/admin-auth.guard';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <ProtectedShell>{children}</ProtectedShell>;
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isReady } = useAdminAuthGuard();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-4 py-4 md:grid-cols-[260px,1fr]">
      <AdminSidebar />
      <div className="space-y-4">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
