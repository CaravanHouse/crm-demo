"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/content/seed";
import { getUI } from "@/content/ui";
import { sameDay } from "@/lib/format";
import { tr, type Locale } from "@/lib/i18n";
import { ManagerAvatar } from "./bits";
import { useStore } from "./store";

type Group = "overdue" | "today" | "tomorrow" | "later";

function groupOf(task: Task, now: Date): Group {
  const due = new Date(task.due);
  if (sameDay(due, now)) return "today";
  if (due < now) return "overdue";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return sameDay(due, tomorrow) ? "tomorrow" : "later";
}

export default function Tasks({ lang, onOpenDeal }: { lang: Locale; onOpenDeal: (id: string) => void }) {
  const ui = getUI(lang);
  const t = ui.tasks;
  const { state, dispatch } = useStore();
  const [title, setTitle] = useState("");
  const now = new Date();
  const groups: Group[] = ["overdue", "today", "tomorrow", "later"];

  const add = () => {
    if (!title.trim()) return;
    dispatch({ type: "addTask", title: title.trim() });
    setTitle("");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h1>
      <div className="mt-6 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={t.add} className="input h-11" />
        <button type="button" onClick={add} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.addButton}</span>
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {groups.map((g) => {
          const list = state.tasks.filter((task) => groupOf(task, now) === g).sort((a, b) => Number(a.done) - Number(b.done));
          if (!list.length) return null;
          return (
            <section key={g}>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${g === "overdue" ? "text-bad" : "text-subtle"}`}>
                {t[g]} · {list.filter((x) => !x.done).length}
              </h2>
              <ul className="panel mt-2 overflow-hidden">
                {list.map((task) => {
                  const deal = task.dealId ? state.deals.find((d) => d.id === task.dealId) : undefined;
                  return (
                    <li key={task.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                      <button
                        type="button"
                        aria-pressed={task.done}
                        aria-label={`${t.done}: ${tr(task.title, lang)}`}
                        onClick={() => dispatch({ type: "toggleTask", id: task.id })}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${task.done ? "border-ok bg-ok text-white" : "border-line hover:border-brand"}`}
                      >
                        {task.done ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${task.done ? "text-subtle line-through" : ""}`}>{tr(task.title, lang)}</p>
                        {deal ? (
                          <button type="button" onClick={() => onOpenDeal(deal.id)} className="truncate text-xs text-brand hover:underline">
                            {tr(deal.title, lang)}
                          </button>
                        ) : null}
                      </div>
                      <ManagerAvatar id={task.manager} lang={lang} />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
