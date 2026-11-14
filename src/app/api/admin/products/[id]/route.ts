import { NextResponse } from 'next/server';
import { deleteProduct, getProductById, updateProduct } from '@/lib/catalog';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

function toInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);
  const current = getProductById(productId);
  if (!current) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });

  const body = await request.json();

  const updated = updateProduct(productId, {
    title: typeof body.title === 'string' && body.title.trim() ? body.title.trim() : current.title,
    brand: body.brand !== undefined ? String(body.brand).trim() || null : current.brand,
    price: body.price !== undefined ? toInt(body.price) : current.price,
    oldPrice: body.oldPrice !== undefined ? toInt(body.oldPrice) : current.oldPrice,
    category: body.category || current.category,
    subcategory: body.subcategory !== undefined ? body.subcategory || null : current.subcategory,
    badge: body.badge !== undefined ? body.badge || null : current.badge,
    specs: Array.isArray(body.specs) ? body.specs.filter(Boolean) : current.specs,
    description:
      body.description !== undefined ? String(body.description).trim() || null : current.description,
    image: body.image !== undefined ? body.image : current.image,
    gallery: Array.isArray(body.gallery) ? body.gallery.filter(Boolean) : current.gallery,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : current.isActive,
    sort: body.sort !== undefined ? Number(body.sort) || 0 : current.sort,
  });

  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const { id } = await params;
  deleteProduct(Number(id));
  return NextResponse.json({ ok: true });
}
