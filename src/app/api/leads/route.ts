import { NextResponse } from 'next/server';
import { addLead } from '@/lib/catalog';
import { normalizePhone } from '@/lib/utils';

export const runtime = 'nodejs';

type Body = {
  name?: string;
  phone?: string;
  message?: string;
  type?: string;
  productId?: number | null;
};

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch {
    // уведомление не критично для сохранения заявки
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const name = (body.name || '').trim();
  const phone = normalizePhone(body.phone || '');
  const message = (body.message || '').trim().slice(0, 1000);
  const type = ['measure', 'consult', 'order'].includes(body.type || '') ? body.type! : 'measure';

  if (name.length < 2) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
  if (phone.length < 10) return NextResponse.json({ error: 'Укажите телефон' }, { status: 422 });

  const lead = addLead({
    name,
    phone,
    message: message || null,
    type,
    productId: body.productId ?? null,
  });

  const labels: Record<string, string> = {
    measure: 'Замер',
    consult: 'Консультация',
    order: 'Заявка на дверь',
  };
  await notifyTelegram(
    `<b>Новая заявка</b>\nТип: ${labels[type]}\nИмя: ${name}\nТелефон: ${phone}\n${
      message ? `Комментарий: ${message}\n` : ''
    }`,
  );

  return NextResponse.json({ ok: true, id: lead.id });
}
