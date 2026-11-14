import type { Metadata } from 'next';
import { LeadButton } from '@/components/LeadButton';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Телефон, адрес шоурума и мессенджеры компании «Дверной тренд» в Краснодаре.',
};

export default function ContactsPage() {
  const settings = getSettings();

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Контакты</p>
      <h1 className="mt-3 text-[36px] text-forest sm:text-[46px]">Свяжитесь удобным способом</h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-ink/70">
        Позвоните, напишите в мессенджер или оставьте заявку — ответим в течение 15 минут в рабочее время.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <a href={`tel:${settings.phoneHref}`} className="card flex items-center justify-between p-6 transition hover:shadow-soft">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Телефон</p>
              <p className="mt-1 font-display text-2xl text-forest">{settings.phone}</p>
            </div>
            <span className="text-brass">→</span>
          </a>

          <div className="grid gap-3 sm:grid-cols-2">
            <a href={settings.telegram} target="_blank" rel="noopener" className="card p-5 transition hover:shadow-soft">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Telegram</p>
              <p className="mt-1 text-sm font-semibold text-forest">Написать менеджеру</p>
            </a>
            <a href={settings.max} target="_blank" rel="noopener" className="card p-5 transition hover:shadow-soft">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">MAX</p>
              <p className="mt-1 text-sm font-semibold text-forest">Написать в MAX</p>
            </a>
            <a href={settings.vk} target="_blank" rel="noopener" className="card p-5 transition hover:shadow-soft">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">ВКонтакте</p>
              <p className="mt-1 text-sm font-semibold text-forest">Группа компании</p>
            </a>
            <a href={`mailto:${settings.email}`} className="card p-5 transition hover:shadow-soft">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
              <p className="mt-1 text-sm font-semibold text-forest">{settings.email}</p>
            </a>
          </div>

          <div className="card p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Шоурум</p>
            <p className="mt-1 text-sm font-semibold text-ink">{settings.address}</p>
            <p className="mt-1 text-sm text-muted">{settings.hours}</p>
            <p className="mt-3 text-xs text-muted">Доставка: {settings.delivery}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-forest/5 p-8 text-center">
            <p className="text-sm text-muted">Карта проезда — добавьте ссылку на Яндекс.Карты в настройках админки.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-xl text-forest">Заявка на замер</h2>
            <p className="mt-1 text-sm text-muted">Перезвоним, уточним задачу и предложим время.</p>
            <div className="mt-4 flex flex-col gap-2">
              <LeadButton className="btn btn-primary w-full" type="measure">
                Вызвать замерщика
              </LeadButton>
              <LeadButton className="btn btn-ghost w-full" type="consult">
                Задать вопрос
              </LeadButton>
            </div>
          </div>

          <div className="rounded-2xl bg-forest p-6 text-white">
            <p className="font-display text-xl">Работаем без выходных</p>
            <p className="mt-2 text-sm text-white/70">
              {settings.hours}. Заявки с сайта принимаем круглосуточно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
