import { NextResponse } from 'next/server';
import { addReview } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { name?: string; text?: string; rating?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const name = (body.name || '').trim().slice(0, 80);
  const text = (body.text || '').trim().slice(0, 2000);
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

  if (name.length < 2) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
  if (text.length < 10) return NextResponse.json({ error: 'Напишите отзыв подробнее' }, { status: 422 });

  addReview({ name, text, rating });
  return NextResponse.json({ ok: true });
}
