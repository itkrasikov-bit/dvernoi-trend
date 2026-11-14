'use client';

import { useEffect, useState } from 'react';

type Props = {
  type?: 'measure' | 'consult' | 'order';
  productId?: number;
  productTitle?: string;
  className?: string;
  children: React.ReactNode;
};

const TITLES: Record<string, string> = {
  measure: 'Вызвать замерщика',
  consult: 'Консультация',
  order: 'Оформить заявку',
};

export function LeadButton({ type = 'measure', productId, productTitle, className, children }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) document.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          message: form.get('message'),
          type,
          productId,
        }),
      });
      if (!res.ok) throw new Error('Не удалось отправить');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[480px] rounded-t-3xl bg-paper p-6 shadow-soft sm:rounded-3xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink/40 hover:bg-cream hover:text-ink"
            >
              ✕
            </button>

            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-2xl text-forest">
                  ✓
                </div>
                <h3 className="text-2xl text-forest">Заявка отправлена</h3>
                <p className="mt-2 text-sm text-muted">
                  Перезвоним в течение 15 минут в рабочее время.
                </p>
                <button className="btn btn-primary mt-6" type="button" onClick={() => setOpen(false)}>
                  Хорошо
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">Заявка</p>
                <h3 className="mt-2 text-2xl text-forest">{TITLES[type]}</h3>
                <p className="mt-1 text-sm text-muted">
                  {productTitle ? `Модель: ${productTitle}` : 'Оставьте контакты — перезвоним и всё уточним.'}
                </p>

                <form className="mt-5 space-y-3" onSubmit={submit}>
                  <div>
                    <label className="label" htmlFor="lead-name">
                      Имя
                    </label>
                    <input id="lead-name" name="name" required className="field" placeholder="Как к вам обращаться" />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-phone">
                      Телефон
                    </label>
                    <input
                      id="lead-phone"
                      name="phone"
                      required
                      type="tel"
                      inputMode="tel"
                      className="field"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-message">
                      Комментарий
                    </label>
                    <textarea
                      id="lead-message"
                      name="message"
                      rows={3}
                      className="field resize-none"
                      placeholder="Размер проёма, пожелания по цвету"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Отправляем…' : 'Отправить заявку'}
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-muted">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
