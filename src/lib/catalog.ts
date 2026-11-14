import { readDb, writeDb, nextId, type Category, type Lead, type Product, type Review } from './store';

export type { Category, Lead, Product, Review };

export function getCategories(): (Category & { count: number })[] {
  const db = readDb();
  return db.categories
    .slice()
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title))
    .map((cat) => ({
      ...cat,
      count: db.products.filter((p) => p.isActive && p.category === cat.slug).length,
    }));
}

export function getRootCategories() {
  return getCategories().filter((c) => !c.parent);
}

export function getSubcategories(parent: string) {
  return getCategories().filter((c) => c.parent === parent);
}

export type ProductQuery = {
  category?: string;
  sub?: string;
  q?: string;
  sort?: 'new' | 'price-asc' | 'price-desc' | 'title';
  page?: number;
  perPage?: number;
  includeInactive?: boolean;
};

export function listProducts(query: ProductQuery = {}): { items: Product[]; total: number } {
  const db = readDb();
  let items = db.products.slice();

  if (!query.includeInactive) items = items.filter((p) => p.isActive);
  if (query.category) {
    items = items.filter((p) => p.category === query.category || p.subcategory === query.category);
  }
  if (query.sub) items = items.filter((p) => p.subcategory === query.sub);
  if (query.q) {
    const q = query.q.toLowerCase();
    items = items.filter((p) =>
      [p.title, p.brand, p.description, ...(p.specs || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
      break;
    case 'price-desc':
      items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      break;
    case 'title':
      items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      break;
    default:
      items.sort((a, b) => a.sort - b.sort || b.id - a.id);
  }

  const total = items.length;
  const perPage = query.perPage ?? 12;
  const page = Math.max(1, query.page ?? 1);
  return { items: items.slice((page - 1) * perPage, page * perPage), total };
}

export function getProduct(slug: string): Product | null {
  return readDb().products.find((p) => p.slug === slug) ?? null;
}

export function getProductById(id: number): Product | null {
  return readDb().products.find((p) => p.id === id) ?? null;
}

export function getFeatured(limit = 8): Product[] {
  return readDb()
    .products.filter((p) => p.isActive)
    .sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || a.sort - b.sort)
    .slice(0, limit);
}

export function getRelated(product: Product, limit = 4): Product[] {
  return readDb()
    .products.filter((p) => p.isActive && p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getPublishedReviews(limit = 6): Review[] {
  return readDb()
    .reviews.filter((r) => r.status === 'published')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getAllReviews(): Review[] {
  return readDb()
    .reviews.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReviewsSummary(): { count: number; average: number } {
  const published = readDb().reviews.filter((r) => r.status === 'published');
  const average = published.length
    ? published.reduce((sum, r) => sum + r.rating, 0) / published.length
    : 0;
  return { count: published.length, average };
}

export function getAllLeads(): Lead[] {
  return readDb()
    .leads.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addLead(input: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  let created: Lead | null = null;
  writeDb((db) => {
    created = {
      ...input,
      id: nextId(db.leads),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    db.leads.push(created);
  });
  return created!;
}

export function addReview(input: { name: string; rating: number; text: string }): Review {
  let created: Review | null = null;
  writeDb((db) => {
    created = {
      ...input,
      id: nextId(db.reviews),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.reviews.push(created);
  });
  return created!;
}

export function setLeadStatus(id: number, status: Lead['status']) {
  writeDb((db) => {
    const lead = db.leads.find((l) => l.id === id);
    if (lead) lead.status = status;
  });
}

export function deleteLead(id: number) {
  writeDb((db) => {
    db.leads = db.leads.filter((l) => l.id !== id);
  });
}

export function setReviewStatus(id: number, status: Review['status']) {
  writeDb((db) => {
    const review = db.reviews.find((r) => r.id === id);
    if (review) review.status = status;
  });
}

export function deleteReview(id: number) {
  writeDb((db) => {
    db.reviews = db.reviews.filter((r) => r.id !== id);
  });
}

export function createProduct(input: Omit<Product, 'id' | 'createdAt'> & { slug?: string }): Product {
  let created: Product | null = null;
  writeDb((db) => {
    let slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9а-я]+/gi, '-');
    if (db.products.some((p) => p.slug === slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    created = {
      ...input,
      slug,
      id: nextId(db.products),
      createdAt: new Date().toISOString(),
    };
    db.products.push(created);
  });
  return created!;
}

export function updateProduct(id: number, patch: Partial<Product>): Product | null {
  let updated: Product | null = null;
  writeDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (product) {
      Object.assign(product, patch);
      updated = product;
    }
  });
  return updated;
}

export function deleteProduct(id: number) {
  writeDb((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
}
