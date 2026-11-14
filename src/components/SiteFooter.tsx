import Link from 'next/link';
import type { Category } from '@/lib/catalog';
import type { Settings } from '@/lib/settings';

type Props = {
  settings: Settings;
  categories: Category[];
};

export function SiteFooter({ settings, categories }: Props) {
  return (
    <footer className="mt-24 border-t border-black/5 bg-forest text-white/75">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-white">{settings.company}</p>
          <p className="mt-3 text-sm leading-relaxed">
            Входные и межкомнатные двери, зеркала и фурнитура. Замер, доставка и монтаж по Краснодарскому
            краю, Крыму и Ростовской области.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={settings.telegramChannel} target="_blank" rel="noopener" className="chip-link">
              Telegram
            </a>
            <a href={settings.max} target="_blank" rel="noopener" className="chip-link">
              MAX
            </a>
            <a href={settings.vk} target="_blank" rel="noopener" className="chip-link">
              ВКонтакте
            </a>
          </div>
        </div>

        <div>
          <p className="footer-title">Каталог</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog?category=${c.slug}`} className="hover:text-white">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-title">Компания</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                О нас
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white">
                Услуги
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-white">
                Отзывы
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Блог
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-white">
                Контакты
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer-title">Контакты</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${settings.phoneHref}`} className="text-lg font-semibold text-white hover:text-brass">
                {settings.phone}
              </a>
            </li>
            <li>{settings.hours}</li>
            <li>{settings.address}</li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-white">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.company}. Все права защищены.</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="/admin" className="hover:text-white">
              Панель управления
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
