import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireAdmin } from '@/lib/guard';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не получен' }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: 'Файл больше 12 МБ' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'media', 'products');
  await fs.mkdir(dir, { recursive: true });

  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'photo';
  const name = `${base}-${Date.now().toString().slice(-6)}.jpg`;
  const target = path.join(dir, name);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toFile(target);

  return NextResponse.json({ ok: true, url: `/media/products/${name}` });
}
