import { Lobster_Two, Nunito, Oswald } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/lib/providers';

const bodyFont = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const headingFont = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-heading' });
const brandFont = Lobster_Two({ subsets: ['latin'], weight: ['700'], variable: '--font-brand' });

export const metadata = {
  title: 'Sabor Express - Delivery de Comida',
  description: 'Seu sabor favorito, na sua porta. Pedidos online com entrega rapida.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headingFont.variable} ${brandFont.variable} min-h-screen`}>
        <Providers>
          <div className="relative z-[1]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
