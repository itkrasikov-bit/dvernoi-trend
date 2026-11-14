import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeadButton } from '@/components/LeadButton';
import { ProductCard } from '@/components/ProductCard';
import { getProduct, getRelated } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { formatPrice } from '@/lib/utils';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Товар не найден' };
  return {
    title: `${product.title} — купить в Краснодаре`,
    description:
      product.description?.slice(0, 160) ||
      `${product.title}${product.brand ? ` от ${product.brand}` : ''}. Цена, характеристики и наличие.`,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160) ?? undefined,
      images: product.image ? [product.image] : undefined,
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product || !product.isActive) notFound();

  const settings = getSettings();
  const related = getRelated(product, 4);
  const gallery = product.gallery.length ? product.gallery : product.image ? [product.image] : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    image: gallery.length ? gallery : undefined,
    description: product.description ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: product.price ?? undefined,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: settings.company },
    },
  };

  return (
    <div className="container-x py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-forest">
          Главная
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-forest">
          Каталог
        </Link>
        <span>/</span>
        <Link href={`/catalog?category=${product.category}`} className="hover:text-forest">
          {product.category === 'entrance' ? 'Входные двери' : product.category === 'interior' ? 'Межкомнатные' : product.category === 'mirror' ? 'Зеркала' : 'Фурнитура'}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="card relative aspect-[3/4] overflow-hidden bg-white">
            {gallery[0] ? (
              <Image
                src={gallery[0]}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-sand">🚪</div>
            )}
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{product.brand}</p>
          )}
          <h1 className="mt-2 text-[32px] leading-tight text-forest sm:text-[40px]">{product.title}</h1>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="font-display text-[34px] text-forest">{formatPrice(product.price)}</p>
            {product.oldPrice && (
              <p className="pb-1 text-sm text-muted line-through">{formatPrice(product.oldPrice)}</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <LeadButton className="btn btn-primary" type="order" productId={product.id} productTitle={product.title}>
              Оставить заявку
            </LeadButton>
            <LeadButton className="btn btn-ghost" type="measure" productId={product.id} productTitle={product.title}>
              Вызвать замерщика
            </LeadButton>
            <a href={`tel:${settings.phoneHref}`} className="btn btn-ghost">
              {settings.phone}
            </a>
          </div>

          {product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                Характеристики
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.specs.map((spec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-ink/80"
                  >
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-brass" fill="none">
                      <path d="M4 10.5 8 14l8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-muted">Описание</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">{product.description}</p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ['Замер до покупки', 'Приедем на объект и посчитаем проём'],
              ['Доставка', settings.delivery],
              ['Монтаж', 'Свои мастера, гарантия 5 лет'],
              ['Оплата', 'Наличные, карта, перевод'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-white p-4">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="text-[28px] text-forest">Похожие модели</h2>
            <Link href="/catalog" className="text-sm font-semibold text-brass hover:underline">
              Весь каталог →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
