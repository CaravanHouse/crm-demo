"use client";

import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { managers, sourceColors, type ManagerId, type SourceId } from "@/content/seed";
import { getUI } from "@/content/ui";
import { tr, type Locale } from "@/lib/i18n";
import { useStore } from "./store";

export default function NewDeal({ lang, onClose, onCreated }: { lang: Locale; onClose: () => void; onCreated: () => void }) {
  const ui = getUI(lang);
  const t = ui.form;
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [what, setWhat] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<SourceId>("telegram");
  const [manager, setManager] = useState<ManagerId>("kamola");
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 9 || !what.trim()) {
      setError(true);
      return;
    }
    dispatch({
      type: "addDeal",
      client: { name: { ru: name.trim(), uz: name.trim() }, phone: phone.trim(), district: { ru: "Ташкент", uz: "Toshkent" }, source, tag: { ru: "Новый", uz: "Yangi" } },
      deal: { title: { ru: what.trim(), uz: what.trim() }, amount: Number(amount.replace(/\D/g, "")) || 0, source, manager },
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-deal-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop w-full max-w-lg rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="new-deal-title" className="text-lg font-bold">{t.title}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="rounded-lg p-2 text-muted hover:bg-bg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label={t.name} wide>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
          </Field>
          <Field label={t.phone}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="input" />
          </Field>
          <Field label={t.amount}>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " "))}
              inputMode="numeric"
              placeholder="15 000 000"
              className="input"
            />
          </Field>
          <Field label={t.what} wide>
            <input value={what} onChange={(e) => setWhat(e.target.value)} className="input" />
          </Field>
          <Field label={t.source}>
            <select value={source} onChange={(e) => setSource(e.target.value as SourceId)} className="input cursor-pointer">
              {(Object.keys(sourceColors) as SourceId[]).map((s) => (
                <option key={s} value={s}>
                  {ui.sources[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.manager}>
            <select value={manager} onChange={(e) => setManager(e.target.value as ManagerId)} className="input cursor-pointer">
              {(Object.keys(managers) as ManagerId[]).map((m) => (
                <option key={m} value={m}>
                  {tr(managers[m], lang)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {error ? <p className="mt-3 text-sm text-bad">{t.required}</p> : null}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line px-5 text-sm font-semibold hover:bg-bg">
            {t.cancel}
          </button>
          <button type="button" onClick={save} className="h-11 flex-1 rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-dark">
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
