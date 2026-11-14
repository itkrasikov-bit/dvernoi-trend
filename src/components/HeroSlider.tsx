'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Slide = {
  src: string;
  alt: string;
  position: string;
  caption?: { kicker: string; title: string };
};

const SLIDES: Slide[] = [
  { src: '/media/slider/slide-1.jpg', alt: 'Акция «1 + 1 = 3» на двери', position: '50% 50%' },
  {
    src: '/media/slider/slide-2.jpg',
    alt: 'Металлическая входная дверь с терморазрывом',
    position: '50% 50%',
    caption: { kicker: 'Нестандартные размеры', title: 'Изготовление металлических дверей под ваш проём' },
  },
  { src: '/media/slider/slide-3.jpg', alt: 'Купи дверь, не выходя из дома', position: '16% 50%' },
  {
    src: '/media/slider/slide-4.jpg',
    alt: 'Дверь скрытого монтажа в прихожей',
    position: '50% 50%',
    caption: { kicker: 'Скрытый монтаж', title: 'Двери скрытого монтажа под покраску в цвет стены' },
  },
  { src: '/media/slider/slide-5.jpg', alt: 'Доставка дверей по югу России', position: '82% 50%' },
];

const INTERVAL = 5500;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, go]);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
      aria-roledescription="карусель"
      aria-label="Фотографии дверей и акции"
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-[1.6rem] shadow-soft sm:aspect-[4/3]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={i === 0}
              className="object-cover"
              style={{ objectPosition: slide.position }}
            />
            {slide.caption && (
              <>
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 max-w-[86%] p-5 pb-7">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{slide.caption.kicker}</p>
                  <p className="mt-1 font-display text-[17px] leading-snug text-white sm:text-xl">
                    {slide.caption.title}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Предыдущий слайд"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-forest opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Следующий слайд"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-forest opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
        >
          ›
        </button>

        <div className="absolute bottom-4 right-4 flex gap-1.5 rounded-full bg-ink/30 px-2.5 py-1.5 backdrop-blur">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Слайд ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-brass" />
        Замер на объекте, до покупки
      </div>
    </div>
  );
}
