export const locales = ["ru", "uz"] as const;
export type Locale = (typeof locales)[number];

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { ru: "ru", uz: "uz-Latn" };

/** Текст на двух языках — так хранятся все данные демо (отделения, врачи, цены) */
export type L = { ru: string; uz: string };

export const tr = (text: L, lang: Locale) => text[lang];

/** Цена в сумах с пробелами: 150 000 */
export const sum = (value: number) => value.toLocaleString("ru-RU").replace(/ /g, " ");
