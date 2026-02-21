import { Lobster_Two, Nunito, Oswald } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { AdminShell } from '@/components/layout/AdminShell';

const bodyFont = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const headingFont = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-heading' });
const brandFont = Lobster_Two({ subsets: ['latin'], weight: ['700'], variable: '--font-brand' });

export const metadata = {
  title: 'Sabor Express - Admin',
  description: 'Painel administrativo da Sabor Express',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headingFont.variable} ${brandFont.variable}`}>
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
