'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { useServerCart } from '@/hooks/useServerCart';
import { useTheme } from '@/components/providers/ThemeProvider';
import { t } from '@/lib/i18n';

const navLinks = [
  { href: '/menu', label: t.nav_menu, icon: UtensilsCrossed },
  { href: '/orders', label: t.nav_orders, icon: ClipboardList },
  { href: '/account', label: t.nav_account, icon: User },
];

export function Navbar() {
  const { itemCount } = useServerCart();
  const theme = useTheme();
  const brandName = theme.brandName || t.brand_name;
  const showBrandName = theme.showBrandName ?? true;
  const [isOpen, setIsOpen] = useState(false);
  const logoHeight = theme.logoSize;
  const logoWidth = Math.round(theme.logoSize * 2.2);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand bg-brand-navy/90 backdrop-blur-md">
        <div className="border-b border-brand/70 bg-brand-red/95">
          <p className="mx-auto max-w-6xl px-4 py-1 text-[10px] font-heading uppercase tracking-[0.24em] text-brand-white/95">
            Seu sabor favorito, na sua porta.
          </p>
        </div>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={brandName}
                className="object-contain"
                style={{ height: logoHeight, width: logoWidth }}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand bg-brand-red/20 text-brand-yellow">
                <UtensilsCrossed size={20} />
              </div>
            )}
            {showBrandName && (
              <div className="leading-none">
                <span className="font-brand block text-4xl text-brand-white">{brandName}</span>
                <span className="mt-1 hidden text-[10px] font-heading uppercase tracking-[0.2em] text-brand-gray sm:block">
                  delivery artesanal
                </span>
              </div>
            )}
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-heading uppercase tracking-[0.18em] text-brand-gray transition-colors hover:text-brand-yellow"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/auth/login"
              aria-label={t.nav_login}
              className="rounded-full border border-transparent p-2 transition-colors hover:border-brand hover:bg-brand-navy2"
            >
              <User size={20} />
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full border border-transparent p-2 transition-colors hover:border-brand hover:bg-brand-navy2"
              aria-label={t.nav_cart}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-brand-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="rounded-full border border-transparent p-2 transition-colors hover:border-brand hover:bg-brand-navy2 md:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-brand bg-brand-navy flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand px-5 py-4">
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsOpen(false)}>
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt={brandName}
                    className="object-contain"
                    style={{ height: Math.round(logoHeight * 0.85), width: Math.round(logoWidth * 0.85) }}
                  />
                ) : (
                  <UtensilsCrossed className="text-brand-yellow" size={20} />
                )}
                {showBrandName && <span className="font-brand text-3xl text-brand-white">{brandName}</span>}
              </Link>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 transition-colors hover:bg-brand-navy2">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-heading uppercase tracking-[0.16em] text-brand-gray transition-colors hover:bg-brand-navy2 hover:text-brand-yellow"
                >
                  <Icon size={18} className="text-brand-gray" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-brand p-4 space-y-1">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-heading uppercase tracking-[0.16em] text-brand-gray transition-colors hover:bg-brand-navy2 hover:text-brand-yellow"
              >
                <ShoppingCart size={18} className="text-brand-gray" />
                {t.nav_cart}
                {itemCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-brand-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
