"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";
import { stages, type StageId } from "@/content/seed";
import { getUI } from "@/content/ui";
import { mln, relative } from "@/lib/format";
import { tr, type Locale } from "@/lib/i18n";
import { ManagerAvatar, SourceBadge } from "./bits";
import { useStore } from "./store";

export default function Pipeline({ lang, onOpenDeal }: { lang: Locale; onOpenDeal: (id: string) => void }) {
  const ui = getUI(lang);
  const { state, dispatch } = useStore();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<StageId | null>(null);
  const now = new Date();

  // id сделки берём из dataTransfer (без setData Firefox не начинает перетаскивание), состояние — запасной вариант
  const drop = (stage: StageId, id: string) => {
    if (id) dispatch({ type: "move", id, stage });
    setDragging(null);
    setOver(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{ui.pipeline.title}</h1>
      <p className="mt-1 text-sm text-muted">{ui.pipeline.hint}</p>

      {/* На телефоне колонки листаются по одной, на компьютере видны все */}
      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        {stages.map((stage) => {
          const deals = state.deals.filter((d) => d.stage === stage.id);
          const sum = deals.reduce((s, d) => s + d.amount, 0);
          return (
            <section
              key={stage.id}
              aria-label={ui.stages[stage.id]}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage.id);
              }}
              onDragLeave={() => setOver((o) => (o === stage.id ? null : o))}
              onDrop={(e) => drop(stage.id, e.dataTransfer.getData("text/plain") || dragging || "")}
              className={`flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl p-2.5 transition-colors sm:w-72 xl:w-auto xl:min-w-56 xl:flex-1 ${
                over === stage.id ? "bg-brand-soft ring-2 ring-brand/40" : "bg-[#eeecf4]"
              }`}
            >
              <header className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-3">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  {ui.stages[stage.id]}
                  <span className="rounded-full bg-surface px-2 text-xs text-muted">{deals.length}</span>
                </span>
                <span className="text-xs font-semibold text-muted">{mln(sum, ui)}</span>
              </header>
              <ul className="flex min-h-24 flex-1 flex-col gap-2">
                {deals.length ? (
                  deals.map((deal) => {
                    const client = state.clients.find((c) => c.id === deal.clientId);
                    return (
                      <li
                        key={deal.id}
                        draggable
                        onDragStart={(e) => {
                          setDragging(deal.id);
                          e.dataTransfer.setData("text/plain", deal.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setOver(null);
                        }}
                        className={`group panel cursor-grab p-3 transition-shadow hover:shadow-lg active:cursor-grabbing ${dragging === deal.id ? "opacity-40" : ""} ${
                          deal.fresh ? "animate-glow border-brand" : ""
                        }`}
                      >
                        <button type="button" onClick={() => onOpenDeal(deal.id)} className="block w-full text-left">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm leading-snug font-semibold">{tr(deal.title, lang)}</span>
                            <GripVertical className="h-4 w-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted">{client ? tr(client.name, lang) : ""}</span>
                          <span className="mt-2.5 flex items-center justify-between gap-2">
                            <span className="text-sm font-extrabold">{mln(deal.amount, ui)}</span>
                            <ManagerAvatar id={deal.manager} lang={lang} />
                          </span>
                          <span className="mt-2 flex items-center justify-between gap-2">
                            <SourceBadge source={deal.source} ui={ui} />
                            <span className="text-[11px] text-subtle">{relative(deal.createdAt, now, ui)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-line py-6 text-xs text-subtle">{ui.pipeline.empty}</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
