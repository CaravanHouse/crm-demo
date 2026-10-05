"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { sourceColors, type SourceId } from "@/content/seed";
import { getUI } from "@/content/ui";
import { mln } from "@/lib/format";
import { tr, type Locale } from "@/lib/i18n";
import { initials, SourceBadge } from "./bits";
import { useStore } from "./store";

export default function Clients({ lang, onOpenDeal }: { lang: Locale; onOpenDeal: (id: string) => void }) {
  const ui = getUI(lang);
  const t = ui.clients;
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [source, setSource] = useState<SourceId | "all">("all");

  const query = q.trim().toLowerCase();
  const rows = state.clients
    .map((c) => {
      const deals = state.deals.filter((d) => d.clientId === c.id);
      return { c, deals, total: deals.filter((d) => d.stage !== "lost").reduce((s, d) => s + d.amount, 0) };
    })
    .filter(({ c }) => (source === "all" || c.source === source) && (!query || tr(c.name, lang).toLowerCase().includes(query) || c.phone.replace(/\s/g, "").includes(query.replace(/\s/g, ""))))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t.title} <span className="text-lg text-subtle">{state.clients.length}</span>
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <span className="sr-only">{t.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="input h-10 pl-9 text-sm sm:w-60" />
          </label>
          <select value={source} onChange={(e) => setSource(e.target.value as SourceId | "all")} aria-label={t.source} className="input h-10 cursor-pointer text-sm sm:w-48">
            <option value="all">{t.allSources}</option>
            {(Object.keys(sourceColors) as SourceId[]).map((s) => (
              <option key={s} value={s}>
                {ui.sources[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-xs uppercase tracking-wider text-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">{t.name}</th>
              <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell">{t.phone}</th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">{t.source}</th>
              <th scope="col" className="hidden px-4 py-3 text-center font-bold lg:table-cell">{t.deals}</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, deals, total }) => (
              <tr key={c.id} onClick={() => deals[0] && onOpenDeal(deals[0].id)} className="cursor-pointer border-t border-line transition-colors hover:bg-brand-soft/50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">{initials(tr(c.name, lang))}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{tr(c.name, lang)}</span>
                      <span className="block truncate text-xs text-muted">
                        {tr(c.tag, lang)} · {tr(c.district, lang)}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="hidden px-4 py-3 whitespace-nowrap text-muted md:table-cell">{c.phone}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <SourceBadge source={c.source} ui={ui} />
                </td>
                <td className="hidden px-4 py-3 text-center font-semibold lg:table-cell">{deals.length}</td>
                <td className="px-4 py-3 text-right font-bold whitespace-nowrap">{mln(total, ui)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <p className="p-8 text-center text-muted">{t.empty}</p> : null}
      </div>
    </div>
  );
}
