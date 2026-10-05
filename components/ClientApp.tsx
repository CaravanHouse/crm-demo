"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

// CRM целиком работает в браузере (данные в localStorage), поэтому без серверного рендера — без рассинхрона дат
const App = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
    </div>
  ),
});

export default function ClientApp({ lang }: { lang: Locale }) {
  return <App lang={lang} />;
}
