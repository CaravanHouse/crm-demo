import { getUI } from "@/content/ui";
import type { Locale } from "@/lib/i18n";

// Плашка над сайтом: честно говорит, что это демо, и ведёт в бот заявок CaravanHouse (метка demo_crm)
export default function DemoBar({ lang }: { lang: Locale }) {
  const t = getUI(lang).demo;
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-xs sm:text-sm">
        <span className="text-white/75">{t.text}</span>
        <a
          href="https://t.me/CaravanHousebot?start=demo_crm"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#ffd27a] underline-offset-4 hover:underline"
        >
          {t.cta} →
        </a>
      </div>
    </div>
  );
}
