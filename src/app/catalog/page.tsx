import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { SortSelect } from '@/components/SortSelect';
import { getRootCategories, getSubcategories, listProducts } from '@/lib/catalog';
import { plural } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ category?: string; sub?: string; q?: string; sort?: string; page?: string }>;

export const metadata: Metadata = {
  title: 'Каталог дверей',
  description:
    'Входные и межкомнатные двери, зеркала и фурнитура: цены, характеристики и наличие. Подбор по разделу и производителю.',
};

const SORTS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'title', label: 'По названию' },
];

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = params.category;
  const sub = params.sub;
  const q = params.q?.trim();
  const sort = (params.sort as 'new' | 'price-asc' | 'price-desc' | 'title') || 'new';
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = 12;

  const { items, total } = listProducts({ category, sub, q, sort, page, perPage });
  const categories = getRootCategories();
  const subs = category ? getSubcategories(category) : [];
  const activeCategory = categories.find((c) => c.slug === category);
  const pages = Math.max(1, Math.ceil(total / perPage));

  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, sub, q, sort: sort === 'new' ? undefined : sort, page: undefined, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
  };

  return (
    <div className="container-x py-10">
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-forest">
          Главная
        </Link>
        <span>/</span>
        <span className="text-ink">Каталог</span>
        {activeCategory && (
          <>
            <span>/</span>
            <span className="text-ink">{activeCategory.title}</span>
          </>
        )}
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] text-forest sm:text-[42px]">
            {activeCategory ? activeCategory.title : 'Каталог дверей'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {total} {plural(total, ['модель', 'модели', 'моделей'])}
            {q ? ` по запросу «${q}»` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action="/catalog" className="flex items-center gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            {sub && <input type="hidden" name="sub" value={sub} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Поиск по названию"
              className="field h-10 w-[220px] py-0"
            />
            <button className="btn btn-ghost h-10 px-4" type="submit">
              Найти
            </button>
          </form>
          <SortSelect value={sort} options={SORTS} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/catalog"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !category ? 'bg-forest text-white' : 'bg-white text-ink/70 hover:text-forest'
          }`}
        >
          Все
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/catalog?category=${c.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === c.slug ? 'bg-forest text-white' : 'bg-white text-ink/70 hover:text-forest'
            }`}
          >
            {c.title}
            <span className="ml-1.5 text-xs opacity-60">{c.count}</span>
          </Link>
        ))}
      </div>

      {subs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3">
          {subs.map((s) => (
            <Link
              key={s.slug}
              href={buildHref({ category, sub: sub === s.slug ? undefined : s.slug })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                sub === s.slug
                  ? 'border-brass bg-brass/10 text-brass'
                  : 'border-black/10 text-ink/60 hover:border-brass hover:text-brass'
              }`}
            >
              {s.title}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-16 rounded-2xl bg-white p-12 text-center">
          <p className="font-display text-2xl text-forest">Ничего не найдено</p>
          <p className="mt-2 text-sm text-muted">Попробуйте изменить фильтры или напишите нам — подберём вручную.</p>
          <Link href="/catalog" className="btn btn-primary mt-6">
            Сбросить фильтры
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p === 1 ? undefined : String(p) })}
              className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium ${
                p === page ? 'bg-forest text-white' : 'bg-white text-ink/70 hover:text-forest'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
