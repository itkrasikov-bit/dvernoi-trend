'use client';

import { useState } from 'react';

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          text: form.get('text'),
          rating,
        }),
      });
      if (!res.ok) throw new Error('Не удалось отправить отзыв');
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-2xl text-forest">
          ✓
        </div>
        <h3 className="text-2xl text-forest">Спасибо!</h3>
        <p className="mt-2 text-sm text-muted">
          Отзыв появится на сайте после проверки — обычно это занимает пару часов.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      <h3 className="text-2xl text-forest">Оставить отзыв</h3>
      <p className="mt-1 text-sm text-muted">Расскажите, как прошли замер, доставка и монтаж.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="review-name">
            Имя
          </label>
          <input id="review-name" name="name" required className="field" placeholder="Как к вам обращаться" />
        </div>

        <div>
          <span className="label">Оценка</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} из 5`}
                className={`text-2xl transition ${value <= rating ? 'text-brass' : 'text-sand'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="review-text">
            Отзыв
          </label>
          <textarea
            id="review-text"
            name="text"
            required
            rows={4}
            className="field resize-none"
            placeholder="Что понравилось, что можно улучшить"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Отправляем…' : 'Отправить отзыв'}
        </button>
      </div>
    </form>
  );
}
