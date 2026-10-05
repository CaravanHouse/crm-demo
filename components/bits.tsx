// Мелкие общие элементы интерфейса CRM
import { managers, sourceColors, type ManagerId, type SourceId } from "@/content/seed";
import type { UI } from "@/content/ui";
import { tr, type Locale } from "@/lib/i18n";

export function SourceBadge({ source, ui }: { source: SourceId; ui: UI }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2 py-0.5 text-[11px] font-semibold text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sourceColors[source] }} />
      {ui.sources[source]}
    </span>
  );
}

const managerTone: Record<ManagerId, string> = {
  kamola: "bg-violet-100 text-violet-700",
  sardor: "bg-amber-100 text-amber-800",
  irina: "bg-emerald-100 text-emerald-800",
};

export function ManagerAvatar({ id, lang, size = "sm" }: { id: ManagerId; lang: Locale; size?: "sm" | "md" }) {
  const name = tr(managers[id], lang);
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${managerTone[id]} ${size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-sm"}`}
    >
      {name[0]}
    </span>
  );
}

export function initials(name: string) {
  return name
    .replace(/[«»"]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
