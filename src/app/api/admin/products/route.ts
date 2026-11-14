import { NextResponse } from 'next/server';
import { createProduct, getAllLeads, getAllReviews, getProductById, listProducts } from '@/lib/catalog';
import { requireAdmin } from '@/lib/guard';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  return NextResponse.json({
    products: listProducts({ includeInactive: true, perPage: 1000 }).items,
    leads: getAllLeads(),
    reviews: getAllReviews(),
  });
}

function toInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const body = await request.json();
  const title = String(body.title || '').trim();
  if (!title) return NextResponse.json({ error: 'Укажите название' }, { status: 422 });

  const created = createProduct({
    slug: slugify(title),
    title,
    brand: String(body.brand || '').trim() || null,
    price: toInt(body.price),
    oldPrice: toInt(body.oldPrice),
    category: body.category || 'entrance',
    subcategory: body.subcategory || null,
    badge: body.badge || null,
    specs: Array.isArray(body.specs) ? body.specs.filter(Boolean).slice(0, 8) : [],
    description: String(body.description || '').trim() || null,
    image: body.image || null,
    gallery: Array.isArray(body.gallery) ? body.gallery.filter(Boolean) : [],
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sort: Number(body.sort) || 0,
  });

  return NextResponse.json({ ok: true, product: getProductById(created.id) });
}
