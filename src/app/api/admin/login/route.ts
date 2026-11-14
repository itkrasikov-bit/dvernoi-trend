import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkPassword, createSession, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let password = '';
  try {
    const body = await request.json();
    password = String(body.password || '');
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const session = await createSession();
  const store = await cookies();
  store.set(session.name, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return NextResponse.json({ ok: true });
}
