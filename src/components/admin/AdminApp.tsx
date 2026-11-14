'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lead, Product, Review } from '@/lib/catalog';
import type { Settings } from '@/lib/settings';
import { formatPrice } from '@/lib/utils';

type Tab = 'products' | 'leads' | 'reviews' | 'settings';

const CATEGORY_LABELS: Record<string, string> = {
  entrance: 'Входные двери',
  interior: 'Межкомнатные двери',
  mirror: 'Зеркала',
  hardware: 'Фурнитура',
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  'entrance-flat': 'Для квартиры',
  'entrance-house': 'Для частного дома',
  hidden: 'Скрытого монтажа',
};

const BADGES = ['', 'Хит', 'Новинка', 'Выгодно', 'Под заказ'];

const emptyForm = {
  id: 0,
  title: '',
  brand: '',
  price: '',
  oldPrice: '',
  category: 'entrance',
  subcategory: '',
  badge: '',
  specs: ['', ''],
  description: '',
  image: '',
  isActive: true,
};

type FormState = typeof emptyForm;

export function AdminApp() {
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  const notify = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const load = useCallback(async () => {
    const [dataRes, settingsRes] = await Promise.all([
      fetch('/api/admin/products', { cache: 'no-store' }),
      fetch('/api/admin/settings', { cache: 'no-store' }),
    ]);
    if (dataRes.ok) {
      const data = await dataRes.json();
      setProducts(data.products);
      setLeads(data.leads);
      setReviews(data.reviews);
    }
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setSettings(data.settings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q),
    );
  }, [products, query]);

  const grouped = useMemo(() => {
    const groups: { category: string; items: Product[]; sub: string | null }[] = [];
    for (const item of filtered) {
      const sub = item.subcategory || null;
      let group = groups.find((g) => g.category === item.category && g.sub === sub);
      if (!group) {
        group = { category: item.category, sub, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [filtered]);

  function openNew() {
    setForm({ ...emptyForm });
  }

  function openEdit(product: Product) {
    setForm({
      id: product.id,
      title: product.title,
      brand: product.brand || '',
      price: product.price ? String(product.price) : '',
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      category: product.category,
      subcategory: product.subcategory || '',
      badge: product.badge || '',
      specs: [product.specs[0] || '', product.specs[1] || ''],
      description: product.description || '',
      image: product.image || '',
      isActive: product.isActive,
    });
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload = {
      title: form.title,
      brand: form.brand,
      price: form.price,
      oldPrice: form.oldPrice,
      category: form.category,
      subcategory: form.subcategory || null,
      badge: form.badge || null,
      specs: form.specs.filter(Boolean),
      description: form.description,
      image: form.image || null,
      gallery: form.image ? [form.image] : [],
      isActive: form.isActive,
    };
    try {
      const res = await fetch(form.id ? `/api/admin/products/${form.id}` : '/api/admin/products', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не удалось сохранить');
      }
      setForm(null);
      await load();
      notify('Сохранено');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: number) {
    if (!confirm('Удалить товар?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setForm(null);
    await load();
    notify('Удалено');
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
      setForm((prev) => (prev ? { ...prev, image: json.url } : prev));
      notify('Фото загружено');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  }

  async function updateLead(id: number, status: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function updateReview(id: number, status: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function deleteReview(id: number) {
    if (!confirm('Удалить отзыв?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    await load();
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    notify(res.ok ? 'Настройки сохранены' : 'Не удалось сохранить');
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.href = '/';
  }

  const newLeads = leads.filter((l) => l.status === 'new').length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="container-x py-20 text-center text-sm text-muted">Загружаем данные…</div>
    );
  }

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Админка</p>
          <h1 className="mt-2 text-3xl text-forest">Управление сайтом</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn btn-ghost">
            Открыть сайт
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10 pb-3">
        {[
          ['products', `Товары · ${products.length}`],
          ['leads', `Заявки${newLeads ? ` · ${newLeads}` : ''}`],
          ['reviews', `Отзывы${pendingReviews ? ` · ${pendingReviews}` : ''}`],
          ['settings', 'Настройки'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as Tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-forest text-white' : 'bg-white text-ink/70 hover:text-forest'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest px-5 py-2.5 text-sm text-white shadow-soft">
          {toast}
        </div>
      )}

      {tab === 'products' && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию или бренду"
              className="field h-11 max-w-[340px]"
            />
            <button type="button" className="btn btn-primary h-11" onClick={openNew}>
              + Добавить дверь
            </button>
          </div>

          {form && (
            <form onSubmit={saveProduct} className="card mt-5 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-forest">{form.id ? 'Изменить товар' : 'Новый товар'}</h2>
                <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => setForm(null)}>
                  Закрыть
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
                <div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-black/10 bg-white">
                    {form.image ? (
                      <Image src={form.image} alt="" fill sizes="160px" className="object-contain p-2" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-sand">🚪</div>
                    )}
                  </div>
                  <label className="btn btn-ghost mt-2 w-full cursor-pointer text-xs">
                    {uploading ? 'Загрузка…' : 'Загрузить фото'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Название</label>
                    <input
                      className="field"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Бренд</label>
                    <input
                      className="field"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Плашка</label>
                    <select
                      className="field"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    >
                      {BADGES.map((b) => (
                        <option key={b} value={b}>
                          {b || 'нет'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Цена, ₽</label>
                    <input
                      className="field"
                      inputMode="numeric"
                      placeholder="оставьте пустым для «по запросу»"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Старая цена, ₽</label>
                    <input
                      className="field"
                      inputMode="numeric"
                      value={form.oldPrice}
                      onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Раздел</label>
                    <select
                      className="field"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([slug, title]) => (
                        <option key={slug} value={slug}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Подраздел</label>
                    <select
                      className="field"
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    >
                      <option value="">—</option>
                      {form.category === 'entrance' && (
                        <>
                          <option value="entrance-flat">Для квартиры</option>
                          <option value="entrance-house">Для частного дома</option>
                        </>
                      )}
                      {form.category === 'interior' && <option value="hidden">Скрытого монтажа</option>}
                    </select>
                  </div>
                  <div>
                    <label className="label">Характеристика 1</label>
                    <input
                      className="field"
                      value={form.specs[0]}
                      onChange={(e) => setForm({ ...form, specs: [e.target.value, form.specs[1]] })}
                    />
                  </div>
                  <div>
                    <label className="label">Характеристика 2</label>
                    <input
                      className="field"
                      value={form.specs[1]}
                      onChange={(e) => setForm({ ...form, specs: [form.specs[0], e.target.value] })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Описание</label>
                    <textarea
                      className="field resize-none"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Показывать на сайте
                  </label>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохраняем…' : 'Сохранить'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
                  Отмена
                </button>
                {form.id > 0 && (
                  <button
                    type="button"
                    className="btn ml-auto text-red-600 hover:bg-red-50"
                    onClick={() => removeProduct(form.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 space-y-6">
            {grouped.map((group) => (
              <section key={`${group.category}-${group.sub}`}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                  {CATEGORY_LABELS[group.category] || group.category}
                  {group.sub ? ` · ${SUBCATEGORY_LABELS[group.sub] || group.sub}` : ''}
                  <span className="ml-2 text-xs font-normal text-muted/70">{group.items.length}</span>
                </h3>
                <div className="mt-2 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5 bg-white">
                  {group.items.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-cream/60"
                    >
                      <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-white">
                        {product.image && (
                          <Image src={product.image} alt="" fill sizes="44px" className="object-contain" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{product.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {product.brand || '—'} {!product.isActive && '· скрыт'}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-forest">{formatPrice(product.price)}</span>
                      <span className="shrink-0 text-xs text-brass">Изменить</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {tab === 'leads' && (
        <div className="mt-6 space-y-3">
          {leads.length === 0 && <p className="text-sm text-muted">Заявок пока нет.</p>}
          {leads.map((lead) => (
            <div key={lead.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold text-ink">{lead.name}</p>
                <a href={`tel:${lead.phone}`} className="text-sm text-forest hover:underline">
                  {lead.phone}
                </a>
                {lead.message && <p className="mt-1 text-xs text-muted">{lead.message}</p>}
              </div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs text-ink/70">
                {lead.type === 'measure' ? 'Замер' : lead.type === 'consult' ? 'Консультация' : 'Заявка'}
              </span>
              <span className="text-xs text-muted">{lead.createdAt.slice(0, 16)}</span>
              <div className="flex gap-1">
                {[
                  ['new', 'Новая'],
                  ['progress', 'В работе'],
                  ['done', 'Готово'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateLead(lead.id, value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      lead.status === value ? 'bg-forest text-white' : 'bg-white text-ink/60 hover:text-forest'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="mt-6 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted">Отзывов пока нет.</p>}
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-ink">{review.name}</p>
                <span className="text-brass">{'★'.repeat(review.rating)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    review.status === 'published'
                      ? 'bg-forest/10 text-forest'
                      : review.status === 'pending'
                        ? 'bg-brass/15 text-brass'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  {review.status === 'published' ? 'на сайте' : review.status === 'pending' ? 'на модерации' : 'отклонён'}
                </span>
                <span className="ml-auto text-xs text-muted">{review.createdAt.slice(0, 16)}</span>
              </div>
              <p className="mt-2 text-sm text-ink/80">{review.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary h-9 px-4 text-xs"
                  onClick={() => updateReview(review.id, 'published')}
                >
                  Опубликовать
                </button>
                <button
                  type="button"
                  className="btn btn-ghost h-9 px-4 text-xs"
                  onClick={() => updateReview(review.id, 'rejected')}
                >
                  Отклонить
                </button>
                <button
                  type="button"
                  className="btn h-9 px-4 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => deleteReview(review.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && settings && (
        <form onSubmit={saveSettings} className="card mt-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['phone', 'Телефон (как показывать)'],
                ['phoneHref', 'Телефон для ссылки'],
                ['hours', 'Часы работы'],
                ['address', 'Адрес'],
                ['email', 'Email'],
                ['delivery', 'География доставки'],
                ['telegram', 'Telegram (личка)'],
                ['telegramChannel', 'Telegram-канал'],
                ['max', 'MAX'],
                ['vk', 'ВКонтакте'],
                ['company', 'Название компании'],
              ] as [keyof Settings, string][]
            ).map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  className="field"
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="label">Текст на главной</label>
              <textarea
                className="field resize-none"
                rows={3}
                value={settings.heroText}
                onChange={(e) => setSettings({ ...settings, heroText: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-primary mt-5" disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить настройки'}
          </button>
        </form>
      )}
    </div>
  );
}
