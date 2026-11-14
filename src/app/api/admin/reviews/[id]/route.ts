import { NextResponse } from 'next/server';
import { deleteReview, setReviewStatus, type Review } from '@/lib/catalog';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

const STATUSES: Review['status'][] = ['pending', 'published', 'rejected'];

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const status = STATUSES.includes(body.status) ? (body.status as Review['status']) : null;
  if (!status) return NextResponse.json({ error: 'Неверный статус' }, { status: 422 });

  setReviewStatus(Number(id), status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });
  const { id } = await params;
  deleteReview(Number(id));
  return NextResponse.json({ ok: true });
}
