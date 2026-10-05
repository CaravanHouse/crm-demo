import type { UI } from "@/content/ui";

/** 28 500 000 */
export const money = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ");

/** 28,5 млн — для карточек и графиков */
export const mln = (n: number, ui: UI) => `${(n / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ${ui.mln}`;

/** «5 мин назад», «вчера», «3 дн назад» */
export function relative(iso: string, now: Date, ui: UI) {
  const diff = (now.getTime() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return ui.time.now;
  if (diff < 60) return `${Math.round(diff)} ${ui.time.min}`;
  if (diff < 24 * 60) return `${Math.round(diff / 60)} ${ui.time.hours}`;
  if (diff < 48 * 60) return ui.time.yesterday;
  return `${Math.round(diff / 1440)} ${ui.time.days}`;
}

export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
