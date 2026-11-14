import Image from 'next/image';
import Link from 'next/link';
import { LeadButton } from '@/components/LeadButton';
import { ProductCard } from '@/components/ProductCard';
import {
  getFeatured,
  getPublishedReviews,
  getReviewsSummary,
  getRootCategories,
  listProducts,
  type Product,
} from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { plural } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const SERVICES = [
  {
    title: 'Замер проёма',
    text: 'Выезд на объект, точные размеры и рекомендации по монтажу до покупки.',
    icon: (
      <path d="M3 17h18M6 17V9l4-3 4 3v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    ),
  },
  {
    title: 'Покраска по RAL',
    text: 'Любой цвет из каталога RAL: матовые, глянцевые и структурированные покрытия.',
    icon: <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3 9 9 0 0 0-8-11Z" stroke="currentColor" strokeWidth="1.4" />,
  },
  {
    title: 'Доставка',
    text: 'Краснодарский край, Крым и Ростовская область — своим транспортом.',
    icon: <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  },
  {
    title: 'Монтаж',
    text: 'Установка с гарантией, аккуратно и с уборкой после работ.',
    icon: <path d="M4 20l7-7M14 4l6 6-4 1-3-3 1-4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  },
];

export default function HomePage() {
  const settings = getSettings();
  const categories = getRootCategories();
  const featured = getFeatured(8);
  const reviews = getPublishedReviews(3);
  const summary = getReviewsSummary();

  const categoryImages: Record<string, string | undefined> = {};
  for (const cat of categories) {
    const { items } = listProducts({ category: cat.slug, perPage: 1 });
    categoryImages[cat.slug] = items[0]?.image ?? undefined;
  }

  const hero = '/media/slider/slide-2.jpg';

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Краснодар · с 2015 года</p>
            <h1 className="mt-4 text-[40px] leading-[1.05] text-forest sm:text-[52px] lg:text-[60px]">
              Двери, которые
              <br />
              держат форму
              <span className="text-brass"> и стиль</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-ink/70">
              {settings.heroText}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LeadButton className="btn btn-primary" type="measure">
                Вызвать замерщика
              </LeadButton>
              <Link href="/catalog" className="btn btn-ghost">
                Смотреть каталог
              </Link>
            </div>

            <dl className="mt-10 grid max-w-[520px] grid-cols-3 gap-4 border-t border-black/10 pt-6">
              {[
                ['59', 'моделей в наличии'],
                ['3 дня', 'минимальный срок'],
                ['5 лет', 'гарантия'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-forest">{value}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] shadow-soft">
              <Image
                src={hero}
                alt="Входная дверь с терморазрывом"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5 pt-16">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Нестандартные размеры</p>
                <p className="mt-1 font-display text-xl text-white">
                  Изготовление металлических дверей под ваш проём
                </p>
              </div>
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl bg-paper px-4 py-3 shadow-card sm:block">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Замер</p>
              <p className="text-sm font-semibold text-forest">бесплатно по городу</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-black/5 bg-paper/70">
        <div className="container-x grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Замер до покупки', 'Приедем и посчитаем проём'],
            ['Изготовление от 3 дней', 'Свои мастера и покраска'],
            ['Доставка по югу', 'Край, Крым, Ростов'],
            ['Гарантия 5 лет', 'На двери и монтаж'],
          ].map(([title, text]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/8 text-forest">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Каталог</p>
            <h2 className="mt-3 text-[32px] text-forest sm:text-[40px]">Выберите раздел</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-brass hover:underline">
            Все двери →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const img = categoryImages[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-[1.2rem] bg-forest/90"
              >
                <div className="relative aspect-[4/3]">
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-contain p-4 transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),transparent_60%)]">
                      <svg viewBox="0 0 48 48" className="h-16 w-16 text-white/35" fill="none">
                        <rect x="9" y="6" width="30" height="36" rx="4" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M9 15h30" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                        <circle cx="32" cy="27" r="1.6" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <div>
                    <p className="font-display text-xl text-white">{cat.title}</p>
                    <p className="text-xs text-white/60">{cat.count} моделей</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:bg-white group-hover:text-forest">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-paper/60 py-16">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Витрина</p>
              <h2 className="mt-3 text-[32px] text-forest sm:text-[40px]">Популярные модели</h2>
            </div>
            <Link href="/catalog" className="btn btn-ghost">
              Весь каталог
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* PROMO */}
      <PromoStrip />

      {/* SERVICES */}
      <section className="container-x py-16">
        <div className="max-w-[560px]">
          <p className="eyebrow">Услуги</p>
          <h2 className="mt-3 text-[32px] text-forest sm:text-[40px]">Берём на себя весь путь</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
            От первого замера до момента, когда дверь закрывается мягко и без зазоров.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-forest">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  {s.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-sans text-[15px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="container-x pb-16">
        <div className="grid items-center gap-10 rounded-[1.6rem] bg-forest p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-brass-soft">О компании</p>
            <h2 className="mt-3 text-[30px] text-white sm:text-[38px]">
              Свой замер, своя доставка, свои монтажники
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Работаем с 2015 года. Подбираем двери по размеру проёма, цвету и бюджету, предупреждаем о
              нюансах ремонта и привозим в срок. Если дверь нужна под нестандартный проём — изготовим.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {[
                'Замер и консультация до покупки',
                'Покраска в любой цвет RAL',
                'Двери для квартиры и частного дома',
                'Помогаем с выбором фурнитуры и зеркал',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn btn-light mt-7">
              Подробнее о нас
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem]">
            <Image
              src="/media/slider/slide-4.jpg"
              alt="Прихожая с дверью скрытого монтажа"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container-x pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Отзывы</p>
            <h2 className="mt-3 text-[32px] text-forest sm:text-[40px]">Что говорят клиенты</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-display text-3xl text-forest">{summary.average.toFixed(1)}</p>
              <p className="text-xs text-muted">
                {summary.count} {plural(summary.count, ['отзыв', 'отзыва', 'отзывов'])}
              </p>
            </div>
            <Link href="/reviews" className="btn btn-ghost">
              Все отзывы
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="card flex flex-col p-6">
              <div className="text-brass" aria-label={`Оценка ${r.rating} из 5`}>
                {'★'.repeat(r.rating)}
                <span className="text-sand">{'★'.repeat(5 - r.rating)}</span>
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">«{r.text}»</blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 font-semibold text-forest">
                  {r.name.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-ink">{r.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-4">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-brass/12 p-6 sm:p-10">
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[30px] text-forest sm:text-[36px]">Не нашли нужную дверь?</h2>
              <p className="mt-2 max-w-[520px] text-sm text-ink/70">
                Пришлите размер проёма — подберём модели под бюджет и посчитаем с установкой.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LeadButton className="btn btn-primary" type="measure">
                Вызвать замерщика
              </LeadButton>
              <a href={`tel:${settings.phoneHref}`} className="btn btn-ghost">
                {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PromoStrip() {
  const banners = [
    { src: '/media/slider/slide-1.jpg', alt: 'Акция 1+1=3' },
    { src: '/media/slider/slide-3.jpg', alt: 'Купи дверь не выходя из дома' },
    { src: '/media/slider/slide-5.jpg', alt: 'Доставка дверей по югу России' },
  ];

  return (
    <section className="container-x pb-4">
      <div className="grid gap-4 md:grid-cols-3">
        {banners.map((b) => (
          <div key={b.src} className="relative aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-forest/10">
            <Image src={b.src} alt={b.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
