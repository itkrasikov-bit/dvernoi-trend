import fs from 'node:fs';
import path from 'node:path';

export type Product = {
  id: number;
  slug: string;
  title: string;
  brand: string | null;
  price: number | null;
  oldPrice: number | null;
  category: string;
  subcategory: string | null;
  badge: string | null;
  specs: string[];
  description: string | null;
  image: string | null;
  gallery: string[];
  isActive: boolean;
  sort: number;
  createdAt: string;
};

export type Category = {
  slug: string;
  title: string;
  parent: string | null;
  sort: number;
  count?: number;
};

export type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
};

export type Lead = {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  type: string;
  productId: number | null;
  status: 'new' | 'progress' | 'done';
  createdAt: string;
};

export type Database = {
  categories: Category[];
  products: Product[];
  leads: Lead[];
  reviews: Review[];
  settings: Record<string, string>;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'db.json');

const EMPTY: Database = {
  categories: [
    { slug: 'entrance', title: 'Входные двери', parent: null, sort: 1 },
    { slug: 'entrance-flat', title: 'Для квартиры', parent: 'entrance', sort: 1 },
    { slug: 'entrance-house', title: 'Для частного дома', parent: 'entrance', sort: 2 },
    { slug: 'interior', title: 'Межкомнатные двери', parent: null, sort: 2 },
    { slug: 'hidden', title: 'Скрытого монтажа', parent: 'interior', sort: 1 },
    { slug: 'mirror', title: 'Зеркала', parent: null, sort: 3 },
    { slug: 'hardware', title: 'Фурнитура', parent: null, sort: 4 },
  ],
  products: [],
  leads: [],
  reviews: [],
  settings: {},
};

declare global {
  // eslint-disable-next-line no-var
  var __store: Database | undefined;
}

function ensureFile(): Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(EMPTY, null, 2), 'utf8');
    return structuredClone(EMPTY);
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Partial<Database>;
    return {
      categories: parsed.categories?.length ? parsed.categories : EMPTY.categories,
      products: parsed.products ?? [],
      leads: parsed.leads ?? [],
      reviews: parsed.reviews ?? [],
      settings: parsed.settings ?? {},
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function readDb(): Database {
  if (!globalThis.__store) globalThis.__store = ensureFile();
  return globalThis.__store;
}

/** Атомарная запись: пишем во временный файл и переименовываем. */
export function writeDb(mutate: (db: Database) => void): Database {
  const db = readDb();
  mutate(db);
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, FILE);
  return db;
}

export function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}
