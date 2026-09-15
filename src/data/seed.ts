import type { Award, Chat, Citizen, MarketItem, Message, Rank } from "../types";

export const RANK_META: Record<Rank, { color: string; lvl: number; desc: string }> = {
  НОВИЧОК: { color: "#8f90b5", lvl: 1, desc: "Базовые функции связи" },
  ГРАЖДАНИН: { color: "#6ea8ff", lvl: 2, desc: "Создание групп до 1000 участников" },
  СТРАЖ: { color: "#4ade9c", lvl: 3, desc: "Модерация чатов и комнат" },
  ОФИЦЕР: { color: "#c0c0c0", lvl: 4, desc: "Создание каналов" },
  ГЕНЕРАЛ: { color: "#ff9d5c", lvl: 5, desc: "Управление провинциями" },
  СЕНАТОР: { color: "#ffd700", lvl: 6, desc: "Особые права Сената" },
  ИМПЕРАТОР: { color: "#ffd700", lvl: 7, desc: "Слово Императора — закон" },
};

export const RANK_ORDER: Rank[] = ["НОВИЧОК", "ГРАЖДАНИН", "СТРАЖ", "ОФИЦЕР", "ГЕНЕРАЛ", "СЕНАТОР", "ИМПЕРАТОР"];

export const BANNED_WORDS = ["бунт", "мятеж", "свержение", "предатель", "заговор", "смута", "революци"];

export const PROVINCES = ["Аврора", "Бореаль", "Кристаллис", "Элизиум"];

export const FAKE_DOCS = [
  { name: "Устав_Гипериона.pdf", size: "2.4 МБ" },
  { name: "Отчёт_Легиона_Q3.xlsx", size: "860 КБ" },
  { name: "Карта_провинций.svg", size: "1.1 МБ" },
  { name: "Кодекс_Стража.docx", size: "340 КБ" },
];

export const IMAGES = [
  { url: "https://image.qwenlm.ai/generated-images/08d4304f-e05a-45f9-89d0-9c670c9f93d5/_result.png", name: "Цитадель_Авроры.png" },
  { url: "https://image.qwenlm.ai/generated-images/5ef927f2-404b-414f-b987-c55f4a50e1b8/_result.png", name: "Кристалл_Света.png" },
];

export const AWARDS: Award[] = [
  { id: "a1", name: "Первое слово", emoji: "🕊", desc: "Отправлено первое сообщение", need: 1 },
  { id: "a2", name: "Вестник", emoji: "📯", desc: "10 сообщений во славу Империи", need: 10 },
  { id: "a3", name: "Глас провинции", emoji: "🏛", desc: "25 сообщений в народных комнатах", need: 25 },
  { id: "a4", name: "Золотое перо", emoji: "🪶", desc: "50 сообщений — перо острее меча", need: 50 },
  { id: "a5", name: "Сияющий", emoji: "✨", desc: "100 сообщений. Уровень Света растёт", need: 100 },
];

export const MARKET_ITEMS: MarketItem[] = [
  { id: "mi1", name: "Кристалл Света", emoji: "💎", price: 150, desc: "Усиливает Уровень Света на +25" },
  { id: "mi2", name: "Имперский щит", emoji: "🛡", price: 400, desc: "Золотая рамка профиля Стража" },
  { id: "mi3", name: "Свиток законов", emoji: "📜", price: 90, desc: "Доступ к архиву Сената" },
  { id: "mi4", name: "Золотой значок", emoji: "🏅", price: 250, desc: "Редкий знак отличия гражданина" },
  { id: "mi5", name: "Небесный чай", emoji: "🍵", price: 35, desc: "Восстанавливает силы после патруля" },
];

export const EMOJI_CATS: { name: string; icon: string; list: string[] }[] = [
  { name: "Частые", icon: "⭐", list: "😀 😄 😅 😂 🤣 😊 😍 🤩 😎 🤔 😴 😭 😡 👍 👏 🙏 🔥 ✨ 💛 ⚡ 💫 🎉".split(" ") },
  { name: "Империя", icon: "👑", list: "👑 🏛 🦅 ⚔️ 🛡 🗡 🏰 📜 ⚜️ 🎖 🏅 🪙 💰 🕯 🌟 🌙 ☀️ 🚪 🗝 📯 🐉 🏹".split(" ") },
  { name: "Природа", icon: "🌌", list: "🌌 ❄️ 💎 🌿 🌊 ⛰ 🌅 🌠 🍯 🐺 🦉 🌸 🍀 ⚡ 🌈 🌑".split(" ") },
  { name: "Жесты", icon: "👋", list: "👋 ✌️ 🤝 💪 🫡 🤞 🙌 👀 💬 📣 🤲 👌 🖖 🫶".split(" ") },
  { name: "Знаки", icon: "💠", list: "✅ ❌ ❗ 💠 🔔 🔕 📌 📎 🕐 ♾ 🎯 🚀 ⏳ 🔒 💫".split(" ") },
];

const now = Date.now();
const min = (m: number) => now - m * 60_000;

function c(id: string, name: string, title: string, rank: Rank, hue: number, emoji: string, presence: Citizen["presence"], lastSeenMin: number, light: number): Citizen {
  return { id, name, title, rank, hue, emoji, presence, lastSeen: min(lastSeenMin), light };
}

export function seedCitizens(): Record<string, Citizen> {
  const list: Citizen[] = [
    c("HIT-77777", "Аларик Вейлан", "Сенатор Империи", "СЕНАТОР", 45, "🦅", "online", 0, 342),
    c("HIT-00001", "Гелиос Август", "Император Гипериона", "ИМПЕРАТОР", 48, "👑", "online", 0, 99999),
    c("HIT-00010", "ИИ-ОКО «Эйдос»", "Системный разум Империи", "СЕНАТОР", 190, "👁", "online", 0, 8120),
    c("HIT-24816", "Лирия Вейн", "Картограф врат", "ГРАЖДАНИН", 320, "🌙", "online", 0, 268),
    c("HIT-11002", "Орион Кальт", "Старший дозорный", "СТРАЖ", 160, "🛡", "recent", 12, 410),
    c("HIT-00301", "Кассий Мор", "Член Сената, курия финансов", "СЕНАТОР", 265, "🏛", "online", 0, 1530),
    c("HIT-55110", "Нова Рейн", "Новая гражданка из Авроры", "НОВИЧОК", 20, "🌅", "online", 0, 24),
    c("HIT-90210", "Декс Тарен", "Офицер Легиона Разработчиков", "ОФИЦЕР", 210, "⚙️", "offline", 95, 615),
    c("HIT-31407", "Мира Сол", "Хранительница садов Элизиума", "ГРАЖДАНИН", 130, "🌿", "recent", 40, 187),
    c("HIT-66004", "Барг Железный", "Генерал северных рубежей", "ГЕНЕРАЛ", 200, "❄️", "offline", 220, 2210),
  ];
  return Object.fromEntries(list.map((x) => [x.id, x]));
}

export function seedChats(): Record<string, Chat> {
  // Чистый мессенджер — чаты создаются пользователями
  return {};
}

let seq = 0;
function m(chatId: string, authorId: string, kind: Message["kind"], text: string, minutesAgo: number, extra: Partial<Message> = {}): Message {
  seq += 1;
  const mine = authorId === "HIT-77777";
  return {
    id: `seed-${seq}`,
    chatId,
    authorId,
    kind,
    text,
    ts: min(minutesAgo),
    status: mine ? "read" : "read",
    mine,
    ...extra,
  };
}

export function seedMessages(): Record<string, Message[]> {
  // Чистый мессенджер — сообщения создаются пользователями
  return {};
}

/* Реплики ботов удалены — только государственные каналы */

export const GENERIC_REPLIES = [
  "Принято!",
  "Согласен. Да будет так.",
  "Хм, дай подумать... Ладно, по рукам 🤝",
  "Записал. Сообщу куда следует.",
  "Отличная мысль. Империя гордится тобой.",
  "🔥🔥🔥",
];

export const EDICTS = [
  "Слово Императора: свет разума сильнее тьмы невежества. Да процветает Гиперион.",
  "Указ №118: каждый Страж получает +50 HYPER за безупречную службу. Казначейство исполнит.",
  "Слово Императора: врата открыты для всех, кто несёт свет. Единство — наша крепость.",
];

export const LAWS = [
  "Закон HYR-128: запрещена передача кодов доступа третьим лицам, включая ИИ.",
  "Закон HYR-129: каждый гражданин обязан хранить честь Империи в публичных каналах.",
  "Указ Сената: в воскресенье — день тишины в комнатах провинций.",
];
