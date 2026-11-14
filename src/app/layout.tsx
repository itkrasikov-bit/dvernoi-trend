import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSettings } from '@/lib/settings';
import { getRootCategories } from '@/lib/catalog';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://dvernoitrend.ru'),
  title: {
    default: 'Дверной тренд — входные и межкомнатные двери в Краснодаре',
    template: '%s — Дверной тренд',
  },
  description:
    'Входные и межкомнатные двери под заказ в Краснодаре: замер на объекте, покраска по RAL, доставка по краю, Крыму и Ростовской области, монтаж с гарантией.',
  keywords: [
    'двери Краснодар',
    'входные двери',
    'межкомнатные двери',
    'двери на заказ',
    'термо двери',
    'двери скрытого монтажа',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Дверной тренд',
    title: 'Дверной тренд — двери в Краснодаре',
    description:
      'Входные и межкомнатные двери под ваш проём. Замер, покраска по RAL, доставка и монтаж.',
    images: ['/media/brand/logo-full.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1C3A2E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const categories = getRootCategories();

  return (
    <html lang="ru">
      <body>
        <SiteHeader settings={settings} categories={categories} />
        <main>{children}</main>
        <SiteFooter settings={settings} categories={categories} />
      </body>
    </html>
  );
}
