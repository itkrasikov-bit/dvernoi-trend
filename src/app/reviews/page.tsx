import type { Metadata } from 'next';
import { ReviewForm } from '@/components/ReviewForm';
import { getPublishedReviews, getReviewsSummary } from '@/lib/catalog';
import { formatDate, plural } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Отзывы клиентов',
  description: 'Реальные отзывы о дверях, замере, доставке и монтаже компании «Дверной тренд».',
};

export default function ReviewsPage() {
  const reviews = getPublishedReviews(50);
  const summary = getReviewsSummary();

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Отзывы</p>
      <h1 className="mt-3 text-[36px] text-forest sm:text-[46px]">Нам доверяют ремонт</h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-ink/70">
        Отзывы клиентов о подборе дверей, замере, доставке и монтаже. Оставить свой можно ниже — он появится
        после проверки.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-black/5 bg-white p-5">
            <div>
              <p className="font-display text-4xl text-forest">{summary.average.toFixed(1)}</p>
              <p className="text-xs text-muted">
                {summary.count} {plural(summary.count, ['отзыв', 'отзыва', 'отзывов'])}
              </p>
            </div>
            <div className="text-brass text-lg tracking-[0.15em]" aria-hidden>
              {'★'.repeat(Math.round(summary.average) || 5)}
              <span className="text-sand">{'★'.repeat(5 - Math.round(summary.average))}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length === 0 && <p className="text-sm text-muted">Пока нет опубликованных отзывов.</p>}
            {reviews.map((r) => (
              <article key={r.id} className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 font-semibold text-forest">
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.name}</p>
                      <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-brass" aria-label={`${r.rating} из 5`}>
                    {'★'.repeat(r.rating)}
                    <span className="text-sand">{'★'.repeat(5 - r.rating)}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink/80">{r.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <ReviewForm />
        </aside>
      </div>
    </div>
  );
}
