"use client";

import { ArrowUpRight, Check, Clock, MessageCircle, Phone, StickyNote, TrendingUp } from "lucide-react";
import { revenueHistory, sourceColors, stages, type SourceId } from "@/content/seed";
import { getUI } from "@/content/ui";
import { mln, relative, sameDay } from "@/lib/format";
import { tr, type Locale } from "@/lib/i18n";
import type { View } from "./App";
import { useStore } from "./store";

const activityIcon = { created: MessageCircle, message: MessageCircle, call: Phone, note: StickyNote, stage: TrendingUp } as const;

export default function Dashboard({ lang, go, onOpenDeal }: { lang: Locale; go: (v: View) => void; onOpenDeal: (id: string) => void }) {
  const ui = getUI(lang);
  const t = ui.dashboard;
  const { state, dispatch } = useStore();
  const now = new Date();

  const won = state.deals.filter((d) => d.stage === "won");
  const lost = state.deals.filter((d) => d.stage === "lost");
  const open = state.deals.filter((d) => !["won", "lost"].includes(d.stage));
  // выручка этого месяца: база + выигранные сделки (двигаете карточки — цифра меняется)
  const monthRevenue = 96_000_000 + won.reduce((s, d) => s + d.amount, 0);
  const prevRevenue = revenueHistory[revenueHistory.length - 1] * 1_000_000;
  const growth = Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100);
  const conversion = Math.round((won.length / Math.max(won.length + lost.length + open.length, 1)) * 100);
  const avg = won.length ? won.reduce((s, d) => s + d.amount, 0) / won.length : 0;

  const kpis = [
    { label: t.revenue, value: mln(monthRevenue, ui), sub: `${growth >= 0 ? "+" : ""}${growth}% ${t.vsLast}`, good: growth >= 0 },
    { label: t.pipeline, value: mln(open.reduce((s, d) => s + d.amount, 0), ui), sub: `${open.length} ${t.deals}` },
    { label: t.conversion, value: `${conversion}%`, sub: `${won.length} / ${state.deals.length} ${t.deals}` },
    { label: t.avgDeal, value: mln(avg, ui), sub: ui.currency },
  ];

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return ui.months[d.getMonth()];
  });
  const revenue = [...revenueHistory, Math.round(monthRevenue / 1_000_000)];
  const maxRevenue = Math.max(...revenue) * 1.15;

  const bySource = (Object.keys(sourceColors) as SourceId[]).map((s) => ({ s, n: state.deals.filter((d) => d.source === s).length }));
  const total = bySource.reduce((a, b) => a + b.n, 0) || 1;

  const todayTasks = state.tasks.filter((x) => sameDay(new Date(x.due), now)).slice(0, 5);
  const feed = state.deals
    .flatMap((d) => d.activities.map((a) => ({ ...a, deal: d })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t.hello}, {lang === "ru" ? "Камола" : "Kamola"} 👋
      </h1>
      <p className="mt-1 text-muted">{t.subtitle}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`panel p-4 sm:p-5 ${i === 0 ? "bg-gradient-to-br from-brand to-brand-dark text-white" : ""}`}>
            <p className={`text-xs font-semibold sm:text-sm ${i === 0 ? "text-white/80" : "text-muted"}`}>{k.label}</p>
            <p className="mt-2 text-xl font-extrabold tracking-tight sm:text-3xl">{k.value}</p>
            <p className={`mt-1 text-xs ${i === 0 ? "text-white/80" : k.good ? "text-ok" : "text-subtle"}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel p-5">
          <p className="font-bold">{t.revenueChart}</p>
          <div className="mt-6 flex h-52 items-end gap-3 sm:gap-5" role="img" aria-label={t.revenueChart}>
            {revenue.map((v, i) => {
              const current = i === revenue.length - 1;
              return (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className={`text-xs font-bold ${current ? "text-brand" : "text-muted"}`}>{v}</span>
                  <div
                    className={`w-full max-w-14 rounded-t-xl transition-all duration-700 ${current ? "bg-brand" : "bg-brand-soft"}`}
                    style={{ height: `${(v / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-subtle">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <p className="font-bold">{t.sourcesChart}</p>
          <div className="mt-4 flex items-center gap-5">
            <Donut parts={bySource.map((x) => ({ value: x.n, color: sourceColors[x.s] }))} total={total} label={String(state.deals.length)} />
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {bySource
                .sort((a, b) => b.n - a.n)
                .map((x) => (
                  <li key={x.s} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sourceColors[x.s] }} />
                    <span className="flex-1 text-muted">{ui.sources[x.s]}</span>
                    <span className="font-bold">{Math.round((x.n / total) * 100)}%</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <p className="font-bold">{t.funnel}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {stages.map((s) => {
              const n = state.deals.filter((d) => d.stage === s.id).length;
              const max = Math.max(...stages.map((x) => state.deals.filter((d) => d.stage === x.id).length), 1);
              return (
                <li key={s.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{ui.stages[s.id]}</span>
                    <span className="font-bold">{n}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-bg">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(n / max) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => go("pipeline")} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {ui.nav.pipeline} <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="panel p-5">
          <p className="font-bold">{t.todayTasks}</p>
          <ul className="mt-3 flex flex-col">
            {todayTasks.length ? (
              todayTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 border-b border-line py-2.5 last:border-0">
                  <button
                    type="button"
                    aria-pressed={task.done}
                    aria-label={tr(task.title, lang)}
                    onClick={() => dispatch({ type: "toggleTask", id: task.id })}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${task.done ? "border-ok bg-ok text-white" : "border-line hover:border-brand"}`}
                  >
                    {task.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </button>
                  <span className={`text-sm ${task.done ? "text-subtle line-through" : ""}`}>{tr(task.title, lang)}</span>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-sm text-muted">{t.noTasks}</li>
            )}
          </ul>
          <button type="button" onClick={() => go("tasks")} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {t.allTasks} <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="panel p-5">
          <p className="font-bold">{t.activity}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {feed.map((a) => {
              const Icon = activityIcon[a.kind];
              return (
                <li key={a.id}>
                  <button type="button" onClick={() => onOpenDeal(a.deal.id)} className="flex w-full items-start gap-3 text-left">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{tr(a.deal.title, lang)}</span>
                      <span className="block truncate text-xs text-muted">{tr(a.text, lang)}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-subtle">
                      <Clock className="h-3 w-3" />
                      {relative(a.at, now, ui)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Кольцевая диаграмма на SVG: каждый сегмент — stroke-dasharray по окружности */
function Donut({ parts, total, label }: { parts: { value: number; color: string }[]; total: number; label: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const segments = parts.reduce<{ value: number; color: string; offset: number }[]>((acc, p) => {
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].value : 0;
    return [...acc, { ...p, offset }];
  }, []);
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f1eff6" strokeWidth="16" />
      {segments.map((s, i) => (
        <circle
          key={i}
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="16"
          strokeDasharray={`${(s.value / total) * c} ${c}`}
          strokeDashoffset={-(s.offset / total) * c}
        />
      ))}
      <text x="60" y="66" textAnchor="middle" className="rotate-90 fill-ink text-[22px] font-extrabold" style={{ transformOrigin: "60px 60px" }}>
        {label}
      </text>
    </svg>
  );
}
