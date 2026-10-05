// Демо-данные CRM вымышленной мебельной компании «Dekor Mebel». Даты считаются от момента первого открытия.
import type { L } from "@/lib/i18n";

export type StageId = "new" | "qualified" | "proposal" | "payment" | "won" | "lost";
export type SourceId = "telegram" | "instagram" | "site" | "call" | "referral";
export type ManagerId = "kamola" | "sardor" | "irina";

export const stages: { id: Exclude<StageId, "lost">; color: string }[] = [
  { id: "new", color: "#8b5cf6" },
  { id: "qualified", color: "#a78bfa" },
  { id: "proposal", color: "#f59e0b" },
  { id: "payment", color: "#f97316" },
  { id: "won", color: "#10b981" },
];

export const sourceColors: Record<SourceId, string> = {
  telegram: "#8b5cf6",
  instagram: "#ec4899",
  site: "#f59e0b",
  call: "#10b981",
  referral: "#64748b",
};

export const managers: Record<ManagerId, L> = {
  kamola: { ru: "Камола", uz: "Kamola" },
  sardor: { ru: "Сардор", uz: "Sardor" },
  irina: { ru: "Ирина", uz: "Irina" },
};

export interface Client {
  id: string;
  name: L;
  phone: string;
  district: L;
  source: SourceId;
  tag: L;
}

export interface Activity {
  id: string;
  at: string; // ISO
  kind: "created" | "call" | "note" | "stage" | "message";
  text: L;
}

export interface Deal {
  id: string;
  title: L;
  clientId: string;
  amount: number;
  stage: StageId;
  source: SourceId;
  manager: ManagerId;
  createdAt: string;
  activities: Activity[];
  /** заявка пришла «вживую» во время демо */
  fresh?: boolean;
}

export interface Task {
  id: string;
  title: L;
  due: string; // ISO, день
  dealId?: string;
  manager: ManagerId;
  done: boolean;
}

const C = (id: string, ru: string, uz: string, phone: string, dRu: string, dUz: string, source: SourceId, tRu: string, tUz: string): Client => ({
  id,
  name: { ru, uz },
  phone,
  district: { ru: dRu, uz: dUz },
  source,
  tag: { ru: tRu, uz: tUz },
});

export const seedClients: Client[] = [
  C("c1", "Азиза Каримова", "Aziza Karimova", "+998 90 111 22 33", "Юнусабад", "Yunusobod", "instagram", "Частный клиент", "Xususiy mijoz"),
  C("c2", "Компания «Демо Офис»", "«Demo Ofis» kompaniyasi", "+998 71 200 10 10", "Мирабад", "Mirobod", "site", "B2B", "B2B"),
  C("c3", "Тимур Рашидов", "Timur Rashidov", "+998 93 444 55 66", "Чиланзар", "Chilonzor", "telegram", "Частный клиент", "Xususiy mijoz"),
  C("c4", "Кафе «Пример»", "«Namuna» kafesi", "+998 97 700 80 90", "Шайхантахур", "Shayxontohur", "referral", "HoReCa", "HoReCa"),
  C("c5", "Нодира Абдуллаева", "Nodira Abdullayeva", "+998 99 123 45 67", "Мирзо-Улугбек", "Mirzo Ulugʻbek", "telegram", "Повторный", "Takroriy"),
  C("c6", "Учебный центр «Демо»", "«Demo» oʻquv markazi", "+998 90 555 00 11", "Яккасарай", "Yakkasaroy", "call", "B2B", "B2B"),
  C("c7", "Санжар Мирзаев", "Sanjar Mirzayev", "+998 91 222 33 44", "Сергели", "Sergeli", "instagram", "Частный клиент", "Xususiy mijoz"),
  C("c8", "Гостиница «Вымысел»", "«Xayoliy» mehmonxonasi", "+998 71 300 40 50", "Яшнабад", "Yashnobod", "site", "HoReCa", "HoReCa"),
  C("c9", "Малика Турсунова", "Malika Tursunova", "+998 94 666 77 88", "Юнусабад", "Yunusobod", "telegram", "Частный клиент", "Xususiy mijoz"),
  C("c10", "Салон «Образец»", "«Namuna» saloni", "+998 95 888 99 00", "Алмазар", "Olmazor", "instagram", "Малый бизнес", "Kichik biznes"),
  C("c11", "Бобур Хасанов", "Bobur Hasanov", "+998 90 777 66 55", "Бектемир", "Bektemir", "call", "Частный клиент", "Xususiy mijoz"),
  C("c12", "Клиника «Тест»", "«Test» klinikasi", "+998 71 500 60 70", "Мирабад", "Mirobod", "referral", "B2B", "B2B"),
];

// [клиент, заголовок ru, uz, сумма, этап, менеджер, дней назад]
const D: [string, string, string, number, StageId, ManagerId, number][] = [
  ["c1", "Кухня на заказ, 3,2 м", "Buyurtma oshxona, 3,2 m", 28500000, "proposal", "kamola", 4],
  ["c2", "Офисная мебель на 12 мест", "12 oʻrinli ofis mebeli", 64000000, "payment", "sardor", 9],
  ["c3", "Шкаф-купе в спальню", "Yotoqxona uchun kupe shkaf", 9800000, "new", "irina", 0],
  ["c4", "Столы и стулья для зала", "Zal uchun stol va stullar", 41000000, "qualified", "sardor", 3],
  ["c5", "Детская комната под ключ", "Kalit topshiriladigan bolalar xonasi", 18700000, "won", "kamola", 12],
  ["c6", "Парты для 4 аудиторий", "4 ta auditoriya uchun partalar", 52000000, "proposal", "sardor", 6],
  ["c7", "Гардеробная", "Kiyinish xonasi", 14200000, "qualified", "irina", 2],
  ["c8", "Мебель для 20 номеров", "20 ta xona uchun mebel", 186000000, "proposal", "sardor", 15],
  ["c9", "Прихожая и тумба под ТВ", "Dahliz va TV tumbasi", 7600000, "new", "kamola", 1],
  ["c10", "Ресепшен и зона ожидания", "Resepshn va kutish zonasi", 23500000, "payment", "irina", 7],
  ["c11", "Кухня-остров", "Orolli oshxona", 34800000, "new", "irina", 0],
  ["c12", "Стойка регистрации", "Roʻyxatga olish stoykasi", 12900000, "won", "sardor", 20],
  ["c5", "Шкаф в гостиную", "Mehmonxona uchun shkaf", 11300000, "qualified", "kamola", 5],
  ["c1", "Обеденный стол из массива", "Massivdan ovqat stoli", 8900000, "won", "kamola", 25],
  ["c3", "Рабочий кабинет", "Ish kabineti", 16400000, "lost", "irina", 18],
  ["c7", "Кровать с подъёмным механизмом", "Koʻtariladigan mexanizmli karavot", 6700000, "won", "irina", 9],
];

const sources: Record<string, SourceId> = Object.fromEntries(seedClients.map((c) => [c.id, c.source]));

const stageText: Record<StageId, L> = {
  new: { ru: "Новая заявка", uz: "Yangi ariza" },
  qualified: { ru: "Назначен замер", uz: "Oʻlchov belgilandi" },
  proposal: { ru: "Отправлено КП", uz: "Tijoriy taklif yuborildi" },
  payment: { ru: "Выставлен счёт", uz: "Hisob yuborildi" },
  won: { ru: "Сделка успешна", uz: "Bitim muvaffaqiyatli" },
  lost: { ru: "Отказ клиента", uz: "Mijoz rad etdi" },
};
export const stageLog = stageText;

const sourceText: Record<SourceId, L> = {
  telegram: { ru: "Заявка из Telegram-бота", uz: "Telegram-botdan ariza" },
  instagram: { ru: "Сообщение в Instagram", uz: "Instagramdagi xabar" },
  site: { ru: "Заявка с сайта", uz: "Saytdan ariza" },
  call: { ru: "Входящий звонок", uz: "Kiruvchi qoʻngʻiroq" },
  referral: { ru: "Рекомендация клиента", uz: "Mijoz tavsiyasi" },
};
export const sourceLog = sourceText;

const ago = (now: Date, days: number, hours = 0) => new Date(now.getTime() - (days * 24 + hours) * 3600_000).toISOString();

export function makeSeed(now: Date) {
  const deals: Deal[] = D.map(([clientId, ru, uz, amount, stage, manager, days], i) => {
    const source = sources[clientId];
    const activities: Activity[] = [{ id: `a${i}-0`, at: ago(now, days, 3), kind: "created", text: sourceText[source] }];
    if (stage !== "new") activities.push({ id: `a${i}-1`, at: ago(now, days, 1), kind: "call", text: { ru: "Созвонились, уточнили размеры и бюджет", uz: "Qoʻngʻiroqlashdik, oʻlcham va byudjetni aniqladik" } });
    if (["proposal", "payment", "won"].includes(stage)) activities.push({ id: `a${i}-2`, at: ago(now, Math.max(days - 2, 0), 5), kind: "stage", text: stageText.proposal });
    if (["payment", "won"].includes(stage)) activities.push({ id: `a${i}-3`, at: ago(now, Math.max(days - 4, 0), 2), kind: "stage", text: stageText.payment });
    if (stage === "won" || stage === "lost") activities.push({ id: `a${i}-4`, at: ago(now, Math.max(days - 6, 0), 1), kind: "stage", text: stageText[stage] });
    return { id: `d${i + 1}`, title: { ru, uz }, clientId, amount, stage, source, manager, createdAt: ago(now, days, 3), activities: activities.reverse() };
  });

  const day = (offset: number) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString();
  };
  const tasks: Task[] = [
    { id: "t1", title: { ru: "Перезвонить по кухне-острову", uz: "Orolli oshxona boʻyicha qayta qoʻngʻiroq qilish" }, due: day(0), dealId: "d11", manager: "irina", done: false },
    { id: "t2", title: { ru: "Отправить КП гостинице", uz: "Mehmonxonaga tijoriy taklif yuborish" }, due: day(-1), dealId: "d8", manager: "sardor", done: false },
    { id: "t3", title: { ru: "Замер гардеробной в 15:00", uz: "Soat 15:00 da kiyinish xonasini oʻlchash" }, due: day(0), dealId: "d7", manager: "irina", done: false },
    { id: "t4", title: { ru: "Напомнить об оплате счёта", uz: "Hisob toʻlovini eslatish" }, due: day(0), dealId: "d2", manager: "sardor", done: true },
    { id: "t5", title: { ru: "Согласовать цвет фасадов", uz: "Fasad rangini kelishish" }, due: day(1), dealId: "d1", manager: "kamola", done: false },
    { id: "t6", title: { ru: "Подготовить 3D-визуализацию", uz: "3D vizualizatsiya tayyorlash" }, due: day(2), dealId: "d6", manager: "sardor", done: false },
    { id: "t7", title: { ru: "Попросить отзыв после доставки", uz: "Yetkazib berishdan keyin fikr soʻrash" }, due: day(-2), dealId: "d5", manager: "kamola", done: false },
    { id: "t8", title: { ru: "Уточнить адрес доставки", uz: "Yetkazib berish manzilini aniqlash" }, due: day(3), dealId: "d10", manager: "irina", done: false },
  ];
  return { clients: seedClients, deals, tasks };
}

// Выручка по месяцам (млн сум) до текущего месяца — для графика на дашборде
export const revenueHistory = [86, 94, 112, 105, 131];

// Заявки, которые «прилетают» во время демо: как будто их прислал Telegram-бот компании
export const incoming: { name: L; phone: string; title: L; amount: number; source: SourceId }[] = [
  { name: { ru: "Шахноза Юсупова", uz: "Shahnoza Yusupova" }, phone: "+998 90 321 54 76", title: { ru: "Кухня угловая, 2,8 м", uz: "Burchakli oshxona, 2,8 m" }, amount: 24600000, source: "telegram" },
  { name: { ru: "Рустам Алиев", uz: "Rustam Aliyev" }, phone: "+998 93 210 98 76", title: { ru: "Шкаф в прихожую", uz: "Dahliz uchun shkaf" }, amount: 6900000, source: "instagram" },
  { name: { ru: "Кофейня «Демо»", uz: "«Demo» qahvaxonasi" }, phone: "+998 97 120 30 40", title: { ru: "Барная стойка и 8 столов", uz: "Bar stoykasi va 8 ta stol" }, amount: 38000000, source: "telegram" },
  { name: { ru: "Дильшод Каримов", uz: "Dilshod Karimov" }, phone: "+998 99 876 54 32", title: { ru: "Детская двухъярусная кровать", uz: "Bolalar uchun ikki qavatli karavot" }, amount: 8400000, source: "site" },
];
