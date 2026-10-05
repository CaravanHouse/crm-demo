"use client";

import { MessageCircle, Phone, Send, StickyNote, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { managers, stages } from "@/content/seed";
import { getUI } from "@/content/ui";
import { money, relative } from "@/lib/format";
import { tr, type Locale } from "@/lib/i18n";
import { initials, ManagerAvatar, SourceBadge } from "./bits";
import { useStore } from "./store";

const activityIcon = { created: MessageCircle, message: MessageCircle, call: Phone, note: StickyNote, stage: TrendingUp } as const;

export default function DealDrawer({ lang, dealId, onClose }: { lang: Locale; dealId: string; onClose: () => void }) {
  const ui = getUI(lang);
  const t = ui.deal;
  const { state, dispatch } = useStore();
  const [note, setNote] = useState("");
  const deal = state.deals.find((d) => d.id === dealId);
  const client = deal ? state.clients.find((c) => c.id === deal.clientId) : undefined;
  const now = new Date();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!deal || !client) return null;

  const saveNote = () => {
    if (!note.trim()) return;
    dispatch({ type: "note", id: deal.id, text: note.trim() });
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-in flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs text-subtle">#{deal.id.toUpperCase()}</p>
            <h2 id="deal-title" className="text-lg leading-snug font-bold">
              {tr(deal.title, lang)}
            </h2>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">
              {money(deal.amount)} <span className="text-sm font-semibold text-muted">{ui.currency}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-lg p-2 text-muted hover:bg-bg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">
          {/* Этап: кнопками — работает и на телефоне, где перетаскивание неудобно */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-subtle">{t.stage}</p>
            <div className="mt-2 grid grid-cols-5 gap-1">
              {stages.map((s, i) => {
                const index = stages.findIndex((x) => x.id === deal.stage);
                const passed = deal.stage !== "lost" && i <= index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={ui.stages[s.id]}
                    onClick={() => dispatch({ type: "move", id: deal.id, stage: s.id })}
                    className="group flex flex-col gap-1.5 text-left"
                  >
                    <span className="h-2 rounded-full transition-colors" style={{ backgroundColor: passed ? s.color : "#ebe8f2" }} />
                    <span className={`truncate text-[10px] ${deal.stage === s.id ? "font-bold text-ink" : "text-subtle group-hover:text-ink"}`}>{ui.stages[s.id]}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => dispatch({ type: "move", id: deal.id, stage: "won" })} className="h-10 flex-1 rounded-xl bg-ok text-sm font-semibold text-white hover:opacity-90">
                {t.won}
              </button>
              <button type="button" onClick={() => dispatch({ type: "move", id: deal.id, stage: "lost" })} className="h-10 rounded-xl border border-line px-4 text-sm font-semibold text-bad hover:bg-bg">
                {t.lost}
              </button>
            </div>
          </div>

          <div className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-subtle">{t.client}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{initials(tr(client.name, lang))}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{tr(client.name, lang)}</p>
                <p className="text-sm text-muted">
                  {client.phone} · {tr(client.district, lang)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${client.phone.replace(/\s/g, "")}`} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold hover:bg-bg">
                <Phone className="h-4 w-4 text-brand" />
                {t.call}
              </a>
              <button type="button" className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-line text-sm font-semibold hover:bg-bg">
                <Send className="h-4 w-4 text-brand" />
                {t.write}
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-subtle">{t.source}</dt>
              <dd className="mt-1">
                <SourceBadge source={deal.source} ui={ui} />
              </dd>
            </div>
            <div>
              <dt className="text-subtle">{t.manager}</dt>
              <dd className="mt-1 flex items-center gap-2 font-semibold">
                <ManagerAvatar id={deal.manager} lang={lang} />
                {tr(managers[deal.manager], lang)}
              </dd>
            </div>
            <div>
              <dt className="text-subtle">{t.created}</dt>
              <dd className="mt-1 font-semibold">{relative(deal.createdAt, now, ui)}</dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-subtle">{t.history}</p>
            <div className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNote()}
                placeholder={t.note}
                className="input h-10 text-sm"
              />
              <button type="button" onClick={saveNote} className="h-10 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-brand">
                {t.addNote}
              </button>
            </div>
            <ol className="mt-4 flex flex-col">
              {deal.activities.map((a, i) => {
                const Icon = activityIcon[a.kind];
                return (
                  <li key={a.id} className="relative flex gap-3 pb-4">
                    {i < deal.activities.length - 1 ? <span aria-hidden="true" className="absolute top-8 bottom-0 left-4 w-px bg-line" /> : null}
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="pt-1">
                      <p className="text-sm">{tr(a.text, lang)}</p>
                      <p className="text-xs text-subtle">{relative(a.at, now, ui)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
}
