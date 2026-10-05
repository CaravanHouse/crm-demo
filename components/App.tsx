"use client";

import { Bell, CheckSquare, KanbanSquare, LayoutDashboard, Plus, RotateCcw, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Deal } from "@/content/seed";
import { getUI } from "@/content/ui";
import { mln, sameDay } from "@/lib/format";
import { locales, tr, type Locale } from "@/lib/i18n";
import Clients from "./Clients";
import Dashboard from "./Dashboard";
import DealDrawer from "./DealDrawer";
import NewDeal from "./NewDeal";
import Pipeline from "./Pipeline";
import { StoreProvider, useStore } from "./store";
import Tasks from "./Tasks";

export type View = "dashboard" | "pipeline" | "clients" | "tasks";
const views: View[] = ["dashboard", "pipeline", "clients", "tasks"];
const icons = { dashboard: LayoutDashboard, pipeline: KanbanSquare, clients: Users, tasks: CheckSquare };

export default function App({ lang }: { lang: Locale }) {
  return (
    <StoreProvider>
      <Shell lang={lang} />
    </StoreProvider>
  );
}

function Shell({ lang }: { lang: Locale }) {
  const ui = getUI(lang);
  const { state, reset, onIncoming } = useStore();
  // вкладка из адреса (#pipeline) — чтобы можно было поделиться ссылкой на раздел
  const [view, setView] = useState<View>(() => {
    const hash = window.location.hash.slice(1) as View;
    return views.includes(hash) ? hash : "dashboard";
  });
  const [openDeal, setOpenDeal] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; deal?: Deal; text?: string }[]>([]);

  const go = (v: View) => {
    setView(v);
    history.replaceState(null, "", `#${v}`);
    window.scrollTo({ top: 0 });
  };

  const toast = (t: { deal?: Deal; text?: string }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, ...t }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 7000);
  };

  // «Живая» заявка из Telegram-бота → всплывающее уведомление
  useEffect(() => onIncoming((deal) => toast({ deal })), [onIncoming]);

  const freshCount = state.deals.filter((d) => d.fresh).length;
  const openDeals = state.deals.filter((d) => !["won", "lost"].includes(d.stage)).length;
  const today = new Date();
  const dueTasks = state.tasks.filter((t) => !t.done && (sameDay(new Date(t.due), today) || new Date(t.due) < today)).length;
  const counts: Partial<Record<View, number>> = { pipeline: openDeals, tasks: dueTasks };

  return (
    <div className="lg:grid lg:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[16rem_1fr]">
      {/* Боковая панель — на компьютере */}
      <aside className="hidden bg-side text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:self-start">
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-8">
          <Logo />
          <div>
            <p className="font-bold leading-tight">Savdo CRM</p>
            <p className="text-xs text-white/50">{ui.workspace}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {views.map((v) => {
            const Icon = icons[v];
            return (
              <button
                key={v}
                type="button"
                onClick={() => go(v)}
                aria-current={view === v ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  view === v ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{ui.nav[v]}</span>
                {counts[v] ? <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold">{counts[v]}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <button
            type="button"
            onClick={() => {
              reset();
              toast({ text: ui.resetDone });
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            {ui.reset}
          </button>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold">{lang === "ru" ? "К" : "K"}</span>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold">{lang === "ru" ? "Камола" : "Kamola"}</p>
              <p className="truncate text-xs text-white/50">{ui.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 lg:pb-0">
        {/* Верхняя панель */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo />
          </div>
          <GlobalSearch lang={lang} onOpen={setOpenDeal} />
          <button
            type="button"
            onClick={() => go("pipeline")}
            aria-label={ui.live.title}
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line hover:bg-bg"
          >
            <Bell className="h-5 w-5" />
            {freshCount ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">{freshCount}</span>
            ) : null}
          </button>
          <nav aria-label={ui.langLabel} className="hidden sm:block">
            <ul className="flex rounded-xl border border-line p-0.5 text-xs font-bold">
              {locales.map((l) => (
                <li key={l}>
                  <Link href={`/${l}${typeof window !== "undefined" ? window.location.hash : ""}`} className={`flex h-8 items-center rounded-lg px-2.5 uppercase ${l === lang ? "bg-ink text-white" : "text-muted"}`}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{ui.newDeal}</span>
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {view === "dashboard" ? <Dashboard lang={lang} go={go} onOpenDeal={setOpenDeal} /> : null}
          {view === "pipeline" ? <Pipeline lang={lang} onOpenDeal={setOpenDeal} /> : null}
          {view === "clients" ? <Clients lang={lang} onOpenDeal={setOpenDeal} /> : null}
          {view === "tasks" ? <Tasks lang={lang} onOpenDeal={setOpenDeal} /> : null}
        </main>
      </div>

      {/* Нижние вкладки — на телефоне */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {views.map((v) => {
          const Icon = icons[v];
          return (
            <button key={v} type="button" onClick={() => go(v)} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${view === v ? "text-brand" : "text-subtle"}`}>
              <Icon className="h-5 w-5" />
              {ui.nav[v]}
              {counts[v] ? <span className="absolute top-1.5 left-[calc(50%+6px)] rounded-full bg-brand px-1.5 text-[10px] text-white">{counts[v]}</span> : null}
            </button>
          );
        })}
      </nav>

      {openDeal ? <DealDrawer lang={lang} dealId={openDeal} onClose={() => setOpenDeal(null)} /> : null}
      {creating ? (
        <NewDeal
          lang={lang}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            go("pipeline");
          }}
        />
      ) : null}

      {/* Уведомления */}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-24 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="panel animate-pop pointer-events-auto flex items-start gap-3 p-4 shadow-2xl">
            {t.deal ? (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M21.9 4.6 18.7 19.7c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.4 1.4 11.9c-1-.3-1.1-1 .2-1.5L20.5 3.1c.9-.3 1.6.2 1.4 1.5z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {ui.live.title} · {ui.sources[t.deal.source]}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {tr(t.deal.title, lang)} · {mln(t.deal.amount, ui)}
                  </p>
                  <button type="button" onClick={() => setOpenDeal(t.deal!.id)} className="mt-1 text-sm font-semibold text-brand hover:underline">
                    {ui.live.open} →
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold">{t.text}</p>
            )}
            <button type="button" aria-label={ui.deal.close} onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))} className="text-subtle hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#7c3aed" />
      <path d="M11 25l6-7 5 4 7-9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="13" r="2.6" fill="#fff" />
    </svg>
  );
}

/** Поиск по сделкам и клиентам: результат открывает карточку сделки */
function GlobalSearch({ lang, onOpen }: { lang: Locale; onOpen: (id: string) => void }) {
  const ui = getUI(lang);
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setFocus(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return state.deals
      .filter((d) => {
        const client = state.clients.find((c) => c.id === d.clientId);
        return [tr(d.title, lang), client ? tr(client.name, lang) : "", client?.phone ?? ""].some((s) => s.toLowerCase().includes(query));
      })
      .slice(0, 6);
  }, [query, state, lang]);

  return (
    <div ref={box} className="relative min-w-0 flex-1">
      <label className="relative block max-w-md">
        <span className="sr-only">{ui.search}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} placeholder={ui.search} className="input h-10 pl-9 text-sm" />
      </label>
      {focus && results.length ? (
        <ul className="panel absolute top-[calc(100%+0.5rem)] left-0 z-40 w-full max-w-md overflow-hidden p-1.5 shadow-2xl">
          {results.map((d) => {
            const client = state.clients.find((c) => c.id === d.clientId);
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpen(d.id);
                    setFocus(false);
                    setQ("");
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-brand-soft"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{tr(d.title, lang)}</span>
                    <span className="block truncate text-xs text-muted">
                      {client ? tr(client.name, lang) : ""} · {ui.stages[d.stage]}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold">{mln(d.amount, ui)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
