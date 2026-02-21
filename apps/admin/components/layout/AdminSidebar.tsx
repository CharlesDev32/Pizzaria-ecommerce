'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, FolderOpen, Warehouse,
  ClipboardList, Tag, Users, ScrollText, Settings, Truck,
} from 'lucide-react';

const links = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Produtos', href: '/products', icon: Package },
  { label: 'Categorias', href: '/categories', icon: FolderOpen },
  { label: 'Estoque', href: '/inventory', icon: Warehouse },
  { label: 'Pedidos', href: '/orders', icon: ClipboardList },
  { label: 'Entregas', href: '/delivery', icon: Truck },
  { label: 'Cupons', href: '/coupons', icon: Tag },
  { label: 'Usuarios', href: '/users', icon: Users },
  { label: 'Logs', href: '/audit-logs', icon: ScrollText },
  { label: 'Configuracoes', href: '/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card-surface h-fit p-4">
      <div className="mb-4 border-b border-brand pb-4">
        <p className="font-brand text-4xl text-brand-white">Sabor Express</p>
        <p className="text-[10px] font-heading uppercase tracking-[0.2em] text-brand-gray">painel administrativo</p>
      </div>
      <nav className="space-y-1">
        {links.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-heading uppercase tracking-[0.12em] transition-colors',
                isActive
                  ? 'bg-brand-red/20 text-brand-yellow font-semibold'
                  : 'text-brand-gray hover:bg-brand-navy hover:text-brand-white',
              )}
            >
              <Icon size={16} className={isActive ? 'text-brand-yellow' : ''} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
