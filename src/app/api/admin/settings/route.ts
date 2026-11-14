import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guard';
import { getSettings, saveSettings, type Settings } from '@/lib/settings';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });
  return NextResponse.json({ settings: getSettings() });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Нужен вход' }, { status: 401 });

  const body = (await request.json()) as Partial<Settings>;
  const patch: Partial<Settings> = {};
  const allowed: (keyof Settings)[] = [
    'phone',
    'phoneHref',
    'telegram',
    'telegramChannel',
    'max',
    'vk',
    'email',
    'address',
    'hours',
    'delivery',
    'company',
    'heroTitle',
    'heroText',
  ];
  for (const key of allowed) {
    if (typeof body[key] === 'string') patch[key] = body[key] as string;
  }
  saveSettings(patch);
  return NextResponse.json({ ok: true, settings: getSettings() });
}
