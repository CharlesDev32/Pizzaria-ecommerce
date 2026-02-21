'use client';

import Link from 'next/link';
import { UtensilsCrossed, Clock, MapPin, Phone } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { t } from '@/lib/i18n';

export function Footer() {
  const theme = useTheme();
  const brandName = theme.brandName || t.brand_name;
  const showBrandName = theme.showBrandName ?? true;
  const logoHeight = theme.logoSize;
  const logoWidth = Math.round(theme.logoSize * 2.2);

  return (
    <footer className="mt-20 border-t border-brand bg-brand-navy2/70">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
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
              {showBrandName && <span className="font-brand text-4xl text-brand-white">{brandName}</span>}
            </div>
            <p className="max-w-sm text-sm text-brand-gray leading-relaxed">{t.footer_description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-sm uppercase tracking-[0.18em] text-brand-yellow">{t.footer_quick_links}</h3>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li><Link href="/menu" className="transition-colors hover:text-brand-yellow">{t.nav_menu}</Link></li>
              <li><Link href="/orders" className="transition-colors hover:text-brand-yellow">{t.nav_orders}</Link></li>
              <li><Link href="/account" className="transition-colors hover:text-brand-yellow">{t.nav_account}</Link></li>
              <li><Link href="/auth/login" className="transition-colors hover:text-brand-yellow">{t.nav_login}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-sm uppercase tracking-[0.18em] text-brand-yellow">{t.footer_contact}</h3>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-yellow shrink-0" />
                {t.footer_address}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-yellow shrink-0" />
                {t.footer_phone}
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-brand-yellow shrink-0" />
                {t.footer_hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand pt-6 flex flex-col items-center gap-2 text-xs text-brand-gray sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {showBrandName ? `${brandName}. ` : ''}{t.footer_rights}</p>
          <p className="font-heading uppercase tracking-[0.12em] text-brand-yellow">{t.footer_tagline}</p>
        </div>
      </div>
    </footer>
  );
}
