import { readDb, writeDb } from './store';

export type Settings = {
  phone: string;
  phoneHref: string;
  telegram: string;
  telegramChannel: string;
  max: string;
  vk: string;
  email: string;
  address: string;
  hours: string;
  delivery: string;
  company: string;
  heroTitle: string;
  heroText: string;
};

export const DEFAULT_SETTINGS: Settings = {
  phone: '8 (918) 357-66-60',
  phoneHref: '+79183576660',
  telegram: 'https://t.me/79183576660',
  telegramChannel: 'https://t.me/dvernoitrend',
  max: 'https://max.ru/79183576660',
  vk: 'https://vk.com/krasnodardveri93',
  email: 'info@dvernoitrend.ru',
  address: 'Краснодар, ул. Уральская, 98',
  hours: 'Пн–Вс, 9:00–20:00',
  delivery: 'Краснодарский край, Крым, Ростовская область',
  company: 'Дверной тренд',
  heroTitle: 'Двери, которые держат форму и стиль',
  heroText:
    'Входные и межкомнатные двери под ваш проём: замер на объекте, покраска по RAL, доставка и монтаж по Краснодарскому краю, Крыму и Ростовской области.',
};

export function getSettings(): Settings {
  const stored = readDb().settings;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(patch: Partial<Settings>) {
  writeDb((db) => {
    for (const [key, value] of Object.entries(patch)) {
      if (typeof value === 'string') db.settings[key] = value;
    }
  });
}
