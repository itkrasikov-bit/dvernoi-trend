/**
 * Наполняет data/db.json демо-данными: категории, двери, отзывы, настройки.
 * Запуск: node scripts/seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const FILE = path.join(DATA_DIR, 'db.json');
const MEDIA = path.join(ROOT, 'public', 'media');
const OLD = path.resolve(ROOT, '..', 'GOTOVO');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(MEDIA, 'products'), { recursive: true });
fs.mkdirSync(path.join(MEDIA, 'slider'), { recursive: true });
fs.mkdirSync(path.join(MEDIA, 'brand'), { recursive: true });

const categories = [
  { slug: 'entrance', title: 'Входные двери', parent: null, sort: 1 },
  { slug: 'entrance-flat', title: 'Для квартиры', parent: 'entrance', sort: 1 },
  { slug: 'entrance-house', title: 'Для частного дома', parent: 'entrance', sort: 2 },
  { slug: 'interior', title: 'Межкомнатные двери', parent: null, sort: 2 },
  { slug: 'hidden', title: 'Скрытого монтажа', parent: 'interior', sort: 1 },
  { slug: 'mirror', title: 'Зеркала', parent: null, sort: 3 },
  { slug: 'hardware', title: 'Фурнитура', parent: null, sort: 4 },
];

const products = [];
const source = path.join(OLD, 'data', 'products.json');

if (fs.existsSync(source)) {
  const items = JSON.parse(fs.readFileSync(source, 'utf8'));
  let sort = 0;
  let id = 0;
  for (const p of items) {
    sort += 10;
    id += 1;
    let image = null;
    if (p.image) {
      const src = path.join(OLD, 'images', 'products', `${p.image}.jpg`);
      if (fs.existsSync(src)) {
        const dest = path.join(MEDIA, 'products', `${p.image}.jpg`);
        fs.copyFileSync(src, dest);
        image = `/media/products/${p.image}.jpg`;
      }
    }
    products.push({
      id,
      slug: p.image || `dver-${p.id}`,
      title: p.title,
      brand: p.brand ?? null,
      price: typeof p.price === 'number' ? p.price : null,
      oldPrice: null,
      category: p.category,
      subcategory: p.subcat ?? null,
      badge: p.badge ?? null,
      specs: p.specs ?? [],
      description: p.desc ?? null,
      image,
      gallery: image ? [image] : [],
      isActive: true,
      sort,
      createdAt: new Date().toISOString(),
    });
  }
  console.log('товаров:', products.length);
}

for (let i = 1; i <= 5; i++) {
  const src = path.join(OLD, 'images', 'slider', `slide-${i}.jpg`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(MEDIA, 'slider', `slide-${i}.jpg`));
}
for (const name of ['logo.png', 'logo-mark.png', 'logo-full.png']) {
  const src = path.join(OLD, 'images', name);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(MEDIA, 'brand', name));
}

const reviews = [
  {
    id: 1,
    name: 'Ольга',
    rating: 5,
    text: 'Заказывали входную дверь с терморазрывом. Замерщик приехал в день обращения, помог с выбором модели под наш проём. Установили аккуратно, мусор увезли.',
    status: 'published',
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Дмитрий',
    rating: 5,
    text: 'Брал межкомнатные двери в экошпоне на всю квартиру. Понравилось, что сразу посчитали с наличниками и доборами, без сюрпризов в конце.',
    status: 'published',
    createdAt: '2026-08-28T12:30:00.000Z',
  },
  {
    id: 3,
    name: 'Екатерина',
    rating: 4,
    text: 'Двери хорошие, доставили в срок. Немного сдвинулся монтаж из-за загрузки мастеров, но предупредили заранее и всё поставили за один день.',
    status: 'published',
    createdAt: '2026-08-03T16:00:00.000Z',
  },
];

const db = {
  categories,
  products,
  leads: [
    {
      id: 1,
      name: 'Ирина',
      phone: '79180000000',
      message: 'Нужна дверь 900×2100, дом из газобетона',
      type: 'measure',
      productId: null,
      status: 'new',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ],
  reviews,
  settings: {},
};

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('готово:', FILE);
