import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';

type Props = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority }: Props) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_25%,#F2EDE2,transparent_65%)]">
            <svg viewBox="0 0 48 48" className="h-14 w-14 text-sand" fill="none">
              <rect x="9" y="6" width="30" height="36" rx="4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 15h30" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
              <circle cx="32" cy="27" r="1.6" fill="currentColor" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Фото по запросу</span>
          </div>
        )}

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-forest px-2.5 py-1 text-[11px] font-semibold text-white">
            {product.badge}
          </span>
        )}
        {product.oldPrice && product.price && product.oldPrice > product.price && (
          <span className="absolute right-3 top-3 rounded-full bg-brass px-2.5 py-1 text-[11px] font-semibold text-white">
            −{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{product.brand || 'Дверной тренд'}</p>
        <h3 className="mt-1.5 line-clamp-2 font-sans text-[15px] font-semibold leading-snug text-ink">
          {product.title}
        </h3>
        {product.specs.length > 0 && (
          <p className="mt-1.5 line-clamp-1 text-xs text-muted">{product.specs.slice(0, 2).join(' · ')}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {product.oldPrice && (
              <p className="text-xs text-muted line-through">{formatPrice(product.oldPrice)}</p>
            )}
            <p
              className={`text-[17px] font-bold ${
                typeof product.price === 'number' ? 'text-forest' : 'text-muted'
              }`}
            >
              {formatPrice(product.price)}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink/50 transition group-hover:border-forest group-hover:bg-forest group-hover:text-white">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
