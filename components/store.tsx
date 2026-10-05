"use client";

// Состояние CRM: сделки, клиенты, задачи. Хранится в localStorage этого браузера — у каждого посетителя своё демо.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import {
  incoming,
  makeSeed,
  stageLog,
  type Client,
  type Deal,
  type ManagerId,
  type SourceId,
  type StageId,
  type Task,
} from "@/content/seed";
import type { L } from "@/lib/i18n";

const STORAGE_KEY = "savdo-crm-demo-v1";

export interface State {
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  /** сколько «живых» заявок уже прилетело */
  incomingIndex: number;
}

type Action =
  | { type: "move"; id: string; stage: StageId }
  | { type: "note"; id: string; text: string }
  | { type: "addDeal"; client: Omit<Client, "id">; deal: { title: L; amount: number; source: SourceId; manager: ManagerId }; fresh?: boolean }
  | { type: "toggleTask"; id: string }
  | { type: "addTask"; title: string }
  | { type: "incoming" }
  | { type: "reset"; state: State };

const uid = () => Math.random().toString(36).slice(2, 9);
const nowIso = () => new Date().toISOString();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "move":
      return {
        ...state,
        deals: state.deals.map((d) =>
          d.id === action.id && d.stage !== action.stage
            ? { ...d, stage: action.stage, fresh: false, activities: [{ id: uid(), at: nowIso(), kind: "stage", text: stageLog[action.stage] }, ...d.activities] }
            : d
        ),
      };
    case "note":
      return {
        ...state,
        deals: state.deals.map((d) =>
          d.id === action.id ? { ...d, activities: [{ id: uid(), at: nowIso(), kind: "note", text: { ru: action.text, uz: action.text } }, ...d.activities] } : d
        ),
      };
    case "addDeal": {
      const client: Client = { ...action.client, id: `c-${uid()}` };
      const deal: Deal = {
        id: `d-${uid()}`,
        ...action.deal,
        clientId: client.id,
        stage: "new",
        createdAt: nowIso(),
        fresh: action.fresh,
        activities: [
          {
            id: uid(),
            at: nowIso(),
            kind: action.fresh ? "message" : "created",
            text: action.fresh
              ? { ru: "Заявка из Telegram-бота: клиент выбрал товар и оставил телефон", uz: "Telegram-botdan ariza: mijoz mahsulotni tanlab, telefonini qoldirdi" }
              : { ru: "Сделка создана вручную", uz: "Bitim qoʻlda yaratildi" },
          },
        ],
      };
      return { ...state, clients: [client, ...state.clients], deals: [deal, ...state.deals] };
    }
    case "toggleTask":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case "addTask": {
      const due = new Date();
      due.setHours(12, 0, 0, 0);
      return { ...state, tasks: [{ id: `t-${uid()}`, title: { ru: action.title, uz: action.title }, due: due.toISOString(), manager: "kamola", done: false }, ...state.tasks] };
    }
    case "incoming": {
      const lead = incoming[state.incomingIndex];
      if (!lead) return state;
      const next = reducer(state, {
        type: "addDeal",
        fresh: true,
        client: { name: lead.name, phone: lead.phone, district: { ru: "Ташкент", uz: "Toshkent" }, source: lead.source, tag: { ru: "Новый", uz: "Yangi" } },
        deal: { title: lead.title, amount: lead.amount, source: lead.source, manager: (["kamola", "sardor", "irina"] as const)[state.incomingIndex % 3] },
      });
      return { ...next, incomingIndex: state.incomingIndex + 1 };
    }
    case "reset":
      return action.state;
  }
}

function initialState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as State;
  } catch {
    // нет доступа к хранилищу — работаем с чистым демо
  }
  return { ...makeSeed(new Date()), incomingIndex: 0 };
}

type Ctx = { state: State; dispatch: (a: Action) => void; reset: () => void; onIncoming: (fn: (deal: Deal) => void) => () => void };
const StoreContext = createContext<Ctx | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const listeners = useRef(new Set<(deal: Deal) => void>());
  const seen = useRef(state.incomingIndex);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // приватный режим — без сохранения
    }
    // новая «живая» заявка — сообщаем подписчикам (тост и колокольчик)
    if (state.incomingIndex > seen.current) {
      seen.current = state.incomingIndex;
      const deal = state.deals.find((d) => d.fresh);
      if (deal) listeners.current.forEach((fn) => fn(deal));
    }
  }, [state]);

  // Заявки «из Telegram-бота»: первая через 8 секунд, дальше раз в 35 секунд, всего четыре
  useEffect(() => {
    const first = window.setTimeout(() => dispatch({ type: "incoming" }), 8000);
    const every = window.setInterval(() => dispatch({ type: "incoming" }), 35000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, []);

  const reset = useCallback(() => {
    seen.current = 0;
    dispatch({ type: "reset", state: { ...makeSeed(new Date()), incomingIndex: 0 } });
  }, []);
  const onIncoming = useCallback((fn: (deal: Deal) => void) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);
  const value = useMemo<Ctx>(() => ({ state, dispatch, reset, onIncoming }), [state, reset, onIncoming]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
