import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LeadButton } from '@/components/LeadButton';
import { getReviewsSummary } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'О компании',
  description:
    '«Дверной тренд» — двери в Краснодаре с 2015 года: свой замер, покраска, доставка и монтаж.',
};

export default function AboutPage() {
  const settings = getSettings();
  const summary = getReviewsSummary();

  return (
    <div className="container-x py-12">
      <p className="eyebrow">О нас</p>
      <h1 className="mt-3 max-w-[720px] text-[36px] leading-tight text-forest sm:text-[46px]">
        С 2015 года ставим двери, которые не хочется менять
      </h1>
      <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-ink/70">
        Мы занимаемся входными и межкомнатными дверями, зеркалами и фурнитурой. Работаем с квартирами,
        домами и коммерческими объектами в Краснодаре, по краю, в Крыму и Ростовской области.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['10 лет', 'на рынке дверей'],
          ['59', 'моделей в каталоге'],
          ['5 лет', 'гарантия на монтаж'],
        ].map(([value, label]) => (
          <div key={label} className="card p-6">
            <p className="font-display text-3xl text-forest">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
          <Image src="/media/slider/slide-4.jpg" alt="Интерьер с дверью" fill sizes="50vw" className="object-cover" />
        </div>
        <div>
          <h2 className="text-[28px] text-forest">Как мы работаем</h2>
          <ul className="mt-5 space-y-4">
            {[
              ['Замер до покупки', 'Смотрим проём, стену и сторону открывания — без «примерно».'],
              ['Подбор под бюджет', 'Показываем варианты от эконом до премиум, объясняем разницу.'],
              ['Свои мастера', 'Монтажники в штате, поэтому не зависим от подрядчиков.'],
              ['Гарантия и сервис', 'Регулируем дверь после установки, меняем фурнитуру.'],
            ].map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 rounded-[1.4rem] bg-brass/12 p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl text-forest">Приезжайте в шоурум</h2>
            <p className="mt-2 text-sm text-ink/70">
              {settings.address} · {settings.hours}
            </p>
            <p className="mt-1 text-sm text-ink/70">
              Средняя оценка клиентов: <strong>{summary.average.toFixed(1)}</strong> из 5
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LeadButton className="btn btn-primary" type="consult">
              Задать вопрос
            </LeadButton>
            <Link href="/contacts" className="btn btn-ghost">
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
