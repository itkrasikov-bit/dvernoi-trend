'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/catalog';
import type { Settings } from '@/lib/settings';
import { LeadButton } from './LeadButton';

type Props = {
  settings: Settings;
  categories: Category[];
};

const NAV = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/services', label: 'Услуги' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/about', label: 'О нас' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакты' },
];

export function SiteHeader({ settings, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest text-white/80">
        <div className="container-x flex h-9 items-center justify-between text-[12px]">
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href={`tel:${settings.phoneHref}`}>
              {settings.phone}
            </a>
            <span className="hidden text-white/50 sm:inline">•</span>
            <span className="hidden sm:inline">{settings.hours}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-white/60">{settings.delivery}</span>
            <div className="flex items-center gap-2">
              <a
                href={settings.telegramChannel}
                target="_blank"
                rel="noopener"
                className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] hover:border-white/60 hover:text-white"
              >
                Telegram
              </a>
              <a
                href={settings.max}
                target="_blank"
                rel="noopener"
                className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] hover:border-white/60 hover:text-white"
              >
                MAX
              </a>
              <a
                href={settings.vk}
                target="_blank"
                rel="noopener"
                className="hidden rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] hover:border-white/60 hover:text-white sm:inline"
              >
                VK
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`border-b border-black/5 bg-cream/85 backdrop-blur-xl transition-shadow ${
          scrolled ? 'shadow-[0_10px_30px_-24px_rgba(20,24,26,0.5)]' : ''
        }`}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/media/brand/logo-mark.png"
              alt="Дверной тренд"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <span className="leading-tight">
              <span className="block font-display text-[22px] font-semibold text-forest">Дверной тренд</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-muted">двери с 2015 года</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              item.label === 'Каталог' ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setCatalogOpen(true)}
                  onMouseLeave={() => setCatalogOpen(false)}
                >
                  <Link
                    href="/catalog"
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 hover:bg-white hover:text-forest"
                  >
                    Каталог
                    <svg className="ml-1 inline h-3 w-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </Link>
                  {catalogOpen && (
                    <div className="absolute left-0 top-full w-72 pt-2">
                      <div className="card overflow-hidden p-2">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/catalog?category=${cat.slug}`}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-cream hover:text-forest"
                          >
                            {cat.title}
                            <span className="text-xs text-muted">{cat.count}</span>
                          </Link>
                        ))}
                        <div className="mt-1 border-t border-black/5 px-3 py-2">
                          <Link href="/catalog" className="text-xs font-semibold text-brass hover:underline">
                            Смотреть весь каталог →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 hover:bg-white hover:text-forest"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.phoneHref}`}
              className="hidden text-sm font-semibold text-forest hover:text-brass md:block"
            >
              {settings.phone}
            </a>
            <LeadButton className="btn btn-primary hidden sm:inline-flex" type="measure">
              Вызвать замерщика
            </LeadButton>
            <Link
              href="/admin"
              aria-label="Панель управления"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/50 hover:border-forest hover:text-forest sm:flex"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M7 9V6.5a3 3 0 1 1 6 0V9" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Меню"
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 block h-[1.5px] w-5 bg-ink transition-all ${
                    open ? 'top-[5px] rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[5px] block h-[1.5px] w-5 bg-ink transition-all ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-5 bg-ink transition-all ${
                    open ? 'top-[5px] -rotate-45' : 'top-[10px]'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[110px] z-40 overflow-y-auto bg-cream px-5 pb-10 pt-4 lg:hidden">
          <nav className="flex flex-col divide-y divide-black/5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3.5 font-display text-2xl text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"
              >
                {cat.title}
                <span className="text-muted">{cat.count}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-2">
            <a href={`tel:${settings.phoneHref}`} className="btn btn-primary w-full">
              {settings.phone}
            </a>
            <LeadButton className="btn btn-brass w-full" type="measure">
              Вызвать замерщика
            </LeadButton>
            <Link href="/admin" className="btn btn-ghost w-full" onClick={() => setOpen(false)}>
              Панель управления
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
