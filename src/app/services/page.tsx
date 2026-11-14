import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LeadButton } from '@/components/LeadButton';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Услуги: замер, доставка, монтаж',
  description:
    'Замер проёма, покраска по RAL, доставка по Краснодарскому краю, Крыму и Ростовской области, монтаж дверей с гарантией.',
};

const SERVICES = [
  {
    title: 'Замер проёма',
    price: 'Краснодар и край',
    text: 'Выезжаем на объект, проверяем геометрию проёма и толщину стены, предлагаем модели под размер и бюджет. По итогам — точная смета с монтажом.',
  },
  {
    title: 'Покраска по RAL',
    price: 'от 4 500 ₽',
    text: 'Любой цвет из каталога RAL: матовые, глянцевые и структурированные покрытия. Красим в камере, поэтому цвет ровный по всей плоскости.',
  },
  {
    title: 'Доставка',
    price: 'от 1 500 ₽',
    text: 'Свой транспорт: Краснодарский край, Республика Крым, Ростовская область. Поднимаем на этаж, аккуратно разгружаем.',
  },
  {
    title: 'Монтаж',
    price: 'от 6 000 ₽',
    text: 'Свои мастера, установка по уровню, запенивание, наличники и доборы. Убираем за собой и вывозим упаковку.',
  },
  {
    title: 'Замена фурнитуры',
    price: 'от 2 000 ₽',
    text: 'Меняем замки, ручки, петли и доводчики. Подбираем комплект под цвет и стиль двери.',
  },
  {
    title: 'Установка зеркал',
    price: 'от 3 500 ₽',
    text: 'Зеркала в прихожую по индивидуальным размерам: крепление, подсветка, обработка кромки.',
  },
];

export default function ServicesPage() {
  const settings = getSettings();

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Услуги</p>
      <h1 className="mt-3 text-[36px] text-forest sm:text-[46px]">От замера до первого закрытия</h1>
      <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink/70">
        Берём на себя весь путь: подбор двери под проём, покраску, доставку и монтаж. Работаем по
        Краснодарскому краю, Крыму и Ростовской области.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {SERVICES.map((service) => (
          <div key={service.title} className="card flex flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-lg font-semibold text-ink">{service.title}</h2>
              <span className="shrink-0 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-forest">
                {service.price}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{service.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid items-center gap-8 rounded-[1.6rem] bg-forest p-6 text-white sm:p-10 lg:grid-cols-2">
        <div>
          <h2 className="text-[30px] text-white">Вызвать замерщика</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Приедем в удобное время, измерим проём и предложим 2–3 варианта под бюджет. Замер делаем
            до покупки, чтобы дверь точно встала в проём.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LeadButton className="btn btn-light" type="measure">
              Записаться на замер
            </LeadButton>
            <a href={`tel:${settings.phoneHref}`} className="btn border border-white/30 text-white">
              {settings.phone}
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem]">
          <Image src="/media/slider/slide-2.jpg" alt="Замер дверного проёма" fill sizes="50vw" className="object-cover" />
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="text-2xl text-forest">Как проходит работа</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            ['01', 'Заявка', 'Созваниваемся, уточняем задачу'],
            ['02', 'Замер', 'Выезд на объект, смета'],
            ['03', 'Изготовление', 'От 3 дней, покраска по RAL'],
            ['04', 'Монтаж', 'Доставка, установка, уборка'],
          ].map(([num, title, text]) => (
            <li key={num}>
              <p className="font-display text-2xl text-brass">{num}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 text-sm text-muted">
        Не знаете, что подойдёт?{' '}
        <Link href="/contacts" className="font-semibold text-brass hover:underline">
          Напишите нам
        </Link>{' '}
        — подскажем.
      </p>
    </div>
  );
}
