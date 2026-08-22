// ─── Типы ────────────────────────────────────────────────────────────────
export type Rank = "НОВИЧОК" | "ГРАЖДАНИН" | "СТРАЖ" | "ОФИЦЕР" | "ГЕНЕРАЛ" | "СЕНАТОР" | "ИМПЕРАТОР";
export type MsgType = "text" | "image" | "file" | "voice" | "transfer" | "listing" | "law" | "system";
export type MsgStatus = "sent" | "delivered" | "read";
export type ChatKind = "dm" | "group" | "channel" | "province";

export interface Citizen {
  id: string;
  hit: string;
  name: string;
  rank: Rank;
  title?: string;
  online: boolean;
  lastSeen: number;
  rep: number;
  color: string;
  bio?: string;
}

export interface Attachment {
  name?: string;
  url?: string;
  size?: string;
  duration?: number;
  price?: number;
  sold?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  type: MsgType;
  text: string;
  ts: number;
  status: MsgStatus;
  edited?: boolean;
  deleted?: boolean;
  replyTo?: string;
  forwardedFrom?: string;
  att?: Attachment;
}

export interface Chat {
  id: string;
  kind: ChatKind;
  title: string;
  description?: string;
  memberIds: string[];
  pinned?: boolean;
  archived?: boolean;
  muted?: boolean;
  verified?: boolean;
  readOnly?: boolean;
  autoCreated?: boolean;
  lastReadAt: number;
}

export interface Toast {
  id: number;
  kind: "info" | "success" | "warn" | "push";
  title: string;
  body?: string;
  chatId?: string;
  icon?: string;
}

export interface UserMeta {
  hyper: number;
  rep: number;
  awards: string[];
  msgs: number;
  transfers: number;
  purchases: number;
  reports: number;
}

// ─── Справочники Империи ─────────────────────────────────────────────────
export const RANKS: Record<Rank, { color: string; perk: string; order: number }> = {
  НОВИЧОК: { color: "#8f9bb8", perk: "базовые функции", order: 0 },
  ГРАЖДАНИН: { color: "#6ea8ff", perk: "создание групп", order: 1 },
  СТРАЖ: { color: "#5ad1b9", perk: "модерация чатов", order: 2 },
  ОФИЦЕР: { color: "#b78bff", perk: "создание каналов", order: 3 },
  ГЕНЕРАЛ: { color: "#ff7a6e", perk: "управление провинциями", order: 4 },
  СЕНАТОР: { color: "#ffd700", perk: "особые права Сената", order: 5 },
  ИМПЕРАТОР: { color: "#ffd700", perk: "высшая власть", order: 6 },
};

export const LIGHT_LEVELS = [
  { name: "Искра", min: 0 },
  { name: "Факел", min: 20 },
  { name: "Заря", min: 60 },
  { name: "Сияние", min: 150 },
  { name: "Солнце", min: 400 },
];

export const AWARDS: { id: string; name: string; icon: string; desc: string }[] = [
  { id: "first-word", name: "Первое слово", icon: "💬", desc: "Отправить первое сообщение" },
  { id: "voice", name: "Голос Империи", icon: "📜", desc: "Отправить 25 сообщений" },
  { id: "herald", name: "Глашатай", icon: "📯", desc: "Отправить 100 сообщений" },
  { id: "patron", name: "Меценат", icon: "🏛️", desc: "Совершить перевод HYPER" },
  { id: "light", name: "Носитель Света", icon: "✨", desc: "Достичь уровня «Заря»" },
  { id: "keeper", name: "Блюститель", icon: "🛡️", desc: "Подать жалобу Стражам" },
  { id: "merchant", name: "Торговец", icon: "🛒", desc: "Купить товар на Рынке" },
];

export const BANNED_WORDS = ["бунт", "мятеж", "свергнуть", "революция", "смута"];

export const EMOJI_SETS: Record<string, string[]> = {
  Символы: ["⚜️", "👑", "🏛️", "🛡️", "⚔️", "📜", "🦅", "✨", "💫", "🌟", "🔱", "🗝️", "⚖️", "🕊️", "🔥", "🌙"],
  Лица: ["😀", "😄", "😁", "🤣", "😉", "😊", "😍", "🤩", "😎", "🤔", "🫡", "😅", "😂", "🙃", "😇", "🥲", "😤", "😡", "😭", "🥺", "😳", "🤝", "👍", "🙏"],
  Жесты: ["👋", "✌️", "🤞", "🤟", "🤘", "👌", "🤌", "👈", "👉", "👆", "👇", "✋", "🖐️", "💪", "🫰", "🤲", "👏", "🙌", "👐", "🤝"],
  Империя: ["🏰", "🗿", "⛩️", "🌆", "🌌", "🚀", "🛰️", "⚙️", "💠", "🧿", "💎", "🪙", "💰", "🏆", "🎖️", "🎗️", "📡", "🗺️", "⏳", "🕯️"],
  Еда: ["🍇", "🍎", "🍞", "🧀", "🍖", "🍷", "☕", "🍯", "🥂", "🍰"],
  Природа: ["🌞", "🌝", "⭐", "🌈", "❄️", "🌊", "⚡", "🌸", "🌲", "🦋", "🐺", "🦉"],
};

export const EDICTS = [
  "Указ №412. Объявляется Неделя Света. Каждому гражданину — премия 50 HYPER из Казначейства. Да пребудет с вами Свет.",
  "Указ №413. Провинция Аврора признана образцовой по итогам цикла. Слава труду её граждан! Герб провинции украсит Врата.",
  "Указ №414. Повелеваю расширить сеть квантовых ретрансляторов. Связь — кровеносная система Империи.",
  "Указ №415. Рынок Гипериона освобождается от пошлин до конца цикла. Торговля — честь, обман — бесчестье.",
  "Указ №416. Стражам порядка жаловать надбавку. Покой граждан — основа престола.",
  "Указ №417. Всякий гражданин, достигший уровня «Заря», вправе ходатайствовать о земле в провинции Вега.",
];

export const LAWS = [
  "Закон ЛГ-88. Запрещена рассылка спама в комнатах провинций. Штраф — 100 HYPER в пользу Казначейства.",
  "Закон ЛГ-89. Уровень Света не ниже «Факела» даёт право создания каналов и групп свыше 100 участников.",
  "Закон ЛГ-90. Переводы HYPER между гражданами необратимы и скрепляются цифровой печатью Казначейства.",
  "Закон ЛГ-91. Оскорбление Стража при исполнении приравнивается к оскорблению Сената.",
  "Закон ЛГ-92. Голосовые послания свыше 5 минут считаются речами и подлежат регистрации в Летописи.",
];

export const AMBIENT: Record<string, string[]> = {
  aurora: [
    "Кто-нибудь видел северное сияние над Вратами? Сегодня особенно золотое ✨",
    "На рынке Авроры свежая партия кристаллов памяти, цены приятные",
    "Генерал Вальд объявил смотр Стражи в полдень. Не опаздывайте, граждане",
    "Фонтан у Сената снова поёт. Говорят, это к добрым указам",
    "Подскажите, у кого-нибудь остался доступ к старым картам провинции?",
  ],
  vega: [
    "Вега, подъём! Сегодня турнир гладиаторов-дронов на арене 🤖",
    "Пекарня у Южных ворот печёт медовые лепёшки — очередь как за амброзией",
    "Офицер Рейн набирает добровольцев в ночной дозор. Платят HYPER",
    "Звёзды над Вегой сегодня особенно яркие, к счастью Империи",
  ],
  circle: [
    "Коллеги, отчёт по Авроре готов. Цифры впечатляющие",
    "Предлагаю обсудить новый маршрут караванов на следующем круге",
    "Сенатор Марр созывает внеочередное заседание. Будьте на связи",
  ],
};

export const GENERIC_REPLIES = [
  "Принято, гражданин. Империя ценит твою активность ⚜️",
  "Согласен. Так и запишем в Летопись",
  "Интересная мысль. Обсудим в комнате провинции?",
  "Да будет так. Слава Гипериону!",
  "Хорошо, что написал. Я как раз проверял каналы связи",
  "Подтверждаю. Казначейство уже в курсе",
  "Мудро сказано. Уровень Света растёт на глазах ✨",
];

export const PERSONAL_REPLIES: Record<string, string[]> = {
  elara: [
    "Кстати, ты видел новый указ о Неделе Света? Премия всем! ✨",
    "Согласна. Казначейство сегодня на удивление щедрое",
    "Встретимся вечером в комнате Авроры? Там интересное обсуждение",
    "Я недавно купила кристалл памяти на Рынке — отличная вещь",
    "Ты всегда так быстро отвечаешь. Настоящий гражданин Империи 🏛️",
    "Кассия передавала привет. Говорит, скоро будет новый дозор",
  ],
  kassia: [
    "Докладываю: ночной дозор прошёл без происшествий 🛡️",
    "Генерал доволен результатами смотра. Редкая честь",
    "Если понадобишься — я на связи. Канал защищён",
    "Видела твой профиль. Уровень Света растёт, впечатляет",
  ],
  dorian: [
    "Стража бдит. Нарушений порядка не зафиксировано",
    "Поступила жалоба из Вегы, разбираюсь. Держу в курсе",
    "Порядок — вежливость Империи. Помни об этом, гражданин",
    "Проверил канал — шифрование держится. Спокойно",
  ],
  livia: [
    "Сенат рассмотрит ваше обращение на ближайшем заседании",
    "Благодарю за сигнал. Такие граждане — опора Империи",
    "Закон ЛГ-89 скоро дополним. Есть предложения?",
  ],
  toren: [
    "Дисциплина — мать победы. Хорошо пишешь, гражданин",
    "Аврора на связи. Провинция гордится такими, как ты",
    "Готовься: скоро большой смотр. Понадобятся все руки",
  ],
};

export const FAKE_FILES = [
  { name: "Карта_провинций_Гипериона.pdf", size: "2,4 МБ" },
  { name: "Летопись_цикла_47.docx", size: "812 КБ" },
  { name: "Чертежи_ретранслятора.dwg", size: "5,1 МБ" },
  { name: "Реестр_граждан_Авроры.xlsx", size: "1,2 МБ" },
];

// ─── Форматирование ──────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

export const fmtDay = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return "Сегодня";
  if (d.toDateString() === yest.toDateString()) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};

export const fmtListTime = (ts: number) => {
  const d = new Date(ts);
  if (d.toDateString() === new Date().toDateString()) return fmtTime(ts);
  const diff = Date.now() - ts;
  if (diff < 6 * 86400000) return d.toLocaleDateString("ru-RU", { weekday: "short" });
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
};

export const fmtLastSeen = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return "был(а) только что";
  if (diff < 3600000) return `был(а) ${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `был(а) сегодня в ${fmtTime(ts)}`;
  return `был(а) ${new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`;
};

export const lightLevel = (rep: number) => {
  let idx = 0;
  LIGHT_LEVELS.forEach((l, i) => { if (rep >= l.min) idx = i; });
  const cur = LIGHT_LEVELS[idx];
  const next = LIGHT_LEVELS[idx + 1] ?? null;
  return { ...cur, idx, next, progress: next ? Math.min(1, (rep - cur.min) / (next.min - cur.min)) : 1 };
};

export const filterBanned = (text: string) => {
  let clean = text;
  let hit = false;
  BANNED_WORDS.forEach((w) => {
    const re = new RegExp(w, "gi");
    if (re.test(clean)) {
      hit = true;
      clean = clean.replace(re, (m) => "✦".repeat(m.length));
    }
  });
  return { clean, hit };
};

// ─── Посевные данные ─────────────────────────────────────────────────────
const now = () => Date.now();
const min = (n: number) => now() - n * 60000;
const hr = (n: number) => now() - n * 3600000;
const day = (n: number) => now() - n * 86400000;

export const seedCitizens = (): Record<string, Citizen> => {
  const c: Citizen[] = [
    { id: "emperor", hit: "HIT-00001", name: "Император Гиперион I", rank: "ИМПЕРАТОР", title: "Владыка Цифрового Престола", online: true, lastSeen: now(), rep: 9999, color: "#ffd700", bio: "Слово моё — закон, свет мой — путь." },
    { id: "livia", hit: "HIT-10240", name: "Ливия Марр", rank: "СЕНАТОР", title: "Голос Сената", online: true, lastSeen: now(), rep: 2140, color: "#ffd700", bio: "Закон — это воля Империи, облечённая в форму." },
    { id: "toren", hit: "HIT-20777", name: "Торен Вальд", rank: "ГЕНЕРАЛ", title: "Наместник Авроры", online: true, lastSeen: now(), rep: 1580, color: "#ff7a6e", bio: "Провинция стоит, пока стоит её Стража." },
    { id: "kassia", hit: "HIT-30311", name: "Кассия Рейн", rank: "ОФИЦЕР", title: "Командор ночного дозора", online: false, lastSeen: min(42), rep: 940, color: "#b78bff", bio: "Ночь — это просто день, который охраняют." },
    { id: "dorian", hit: "HIT-40902", name: "Дориан Кетт", rank: "СТРАЖ", title: "Страж порядка Вегы", online: true, lastSeen: now(), rep: 610, color: "#5ad1b9", bio: "Порядок — вежливость Империи." },
    { id: "elara", hit: "HIT-50555", name: "Элара Вейн", rank: "ГРАЖДАНИН", title: "Хранительница Летописи", online: true, lastSeen: now(), rep: 320, color: "#6ea8ff", bio: "Записываю всё. Империя не забывает." },
    { id: "markus", hit: "HIT-51001", name: "Маркус Сол", rank: "ГРАЖДАНИН", title: "Торговец кристаллами", online: false, lastSeen: hr(3), rep: 180, color: "#6ea8ff" },
    { id: "yunna", hit: "HIT-51212", name: "Юнна Таль", rank: "ГРАЖДАНИН", title: "Картограф провинций", online: true, lastSeen: now(), rep: 150, color: "#6ea8ff" },
    { id: "rik", hit: "HIT-51900", name: "Рик Харон", rank: "ГРАЖДАНИН", title: "Инженер ретрансляторов", online: false, lastSeen: day(1), rep: 95, color: "#6ea8ff" },
    { id: "pip", hit: "HIT-60010", name: "Пип Люмен", rank: "НОВИЧОК", title: "Новоприбывший", online: true, lastSeen: now(), rep: 12, color: "#8f9bb8", bio: "Первый день в Империи. Покажите всё!" },
    { id: "treasury", hit: "HIT-00007", name: "Казначейство Гипериона", rank: "СЕНАТОР", title: "Финансовая служба Империи", online: true, lastSeen: now(), rep: 5000, color: "#ffd700", bio: "Каждый HYPER учтён." },
    { id: "herald", hit: "HIT-00008", name: "Вестник Сената", rank: "СЕНАТОР", title: "Официальный публикатор законов", online: true, lastSeen: now(), rep: 5000, color: "#c0c0c0" },
  ];
  return Object.fromEntries(c.map((x) => [x.id, x]));
};

export const seedChats = (): Chat[] => [
  { id: "c-emperor", kind: "channel", title: "Канал Императора", description: "Официальные указы Владыки. Только чтение.", memberIds: ["emperor"], pinned: true, verified: true, readOnly: true, lastReadAt: hr(20) },
  { id: "c-herald", kind: "channel", title: "Вестник Сената", description: "Системные уведомления о законах Империи.", memberIds: ["herald"], verified: true, readOnly: true, lastReadAt: day(1) },
  { id: "c-market", kind: "channel", title: "Рынок Гипериона", description: "Официальные лоты Имперского Рынка. Покупки — в один жест.", memberIds: ["treasury"], verified: true, readOnly: true, lastReadAt: hr(5) },
  { id: "dm-elara", kind: "dm", title: "Элара Вейн", memberIds: ["elara"], pinned: true, lastReadAt: min(90) },
  { id: "g-circle", kind: "group", title: "Круг Стратегов", description: "Закрытый круг планирования провинций", memberIds: ["livia", "toren", "kassia", "dorian"], lastReadAt: hr(3) },
  { id: "c-aurora", kind: "province", title: "Провинция Аврора • Комната", description: "Автоматическая комната провинции Аврора", memberIds: ["toren", "elara", "markus", "yunna", "rik"], autoCreated: true, lastReadAt: hr(1) },
  { id: "c-vega", kind: "province", title: "Провинция Вега • Комната", description: "Автоматическая комната провинции Вега", memberIds: ["kassia", "dorian", "pip", "rik"], autoCreated: true, muted: true, lastReadAt: day(1) },
  { id: "dm-kassia", kind: "dm", title: "Кассия Рейн", memberIds: ["kassia"], lastReadAt: min(15) },
  { id: "dm-treasury", kind: "dm", title: "Казначейство Гипериона", description: "Операции с HYPER, квитанции, баланс", memberIds: ["treasury"], lastReadAt: hr(26) },
  { id: "dm-dorian", kind: "dm", title: "Дориан Кетт", memberIds: ["dorian"], lastReadAt: day(2) },
  { id: "g-fest", kind: "group", title: "Комитет Празднеств", description: "Организация Дня Основания", memberIds: ["elara", "yunna", "pip"], archived: true, lastReadAt: day(9) },
];

export const seedMessages = (): Record<string, Message[]> => ({
  "c-emperor": [
    { id: uid(), chatId: "c-emperor", authorId: "emperor", type: "law", text: EDICTS[3], ts: day(1), status: "read" },
    { id: uid(), chatId: "c-emperor", authorId: "emperor", type: "law", text: EDICTS[1], ts: hr(9), status: "read" },
    { id: uid(), chatId: "c-emperor", authorId: "emperor", type: "law", text: EDICTS[0], ts: hr(1), status: "read" },
  ],
  "c-herald": [
    { id: uid(), chatId: "c-herald", authorId: "herald", type: "system", text: "Канал подключён к реестру законов. Публикация ведётся автоматически.", ts: day(3), status: "read" },
    { id: uid(), chatId: "c-herald", authorId: "herald", type: "law", text: LAWS[0], ts: day(1), status: "read" },
    { id: uid(), chatId: "c-herald", authorId: "herald", type: "law", text: LAWS[2], ts: hr(7), status: "read" },
  ],
  "c-market": [
    { id: uid(), chatId: "c-market", authorId: "treasury", type: "system", text: "Рынок Гипериона открыт. Пошлины отменены Указом №415.", ts: hr(26), status: "read" },
    { id: uid(), chatId: "c-market", authorId: "treasury", type: "listing", text: "Кристалл памяти «Летопись-9» — хранит до 9 циклов истории без искажений", ts: hr(5), status: "read", att: { price: 340, sold: false } },
    { id: uid(), chatId: "c-market", authorId: "treasury", type: "listing", text: "Плащ Стражи (парадный) — соткан из оптоволокна, светится в ночи Вегы", ts: hr(4), status: "read", att: { price: 620, sold: false } },
    { id: uid(), chatId: "c-market", authorId: "treasury", type: "listing", text: "Голограмма герба Империи — для личного пространства, проекция 4К", ts: hr(2), status: "read", att: { price: 150, sold: false } },
  ],
  "dm-elara": [
    { id: uid(), chatId: "dm-elara", authorId: "elara", type: "text", text: "Приветствую, гражданин! Видел новый указ о Неделе Света? ✨", ts: min(130), status: "read" },
    { id: uid(), chatId: "dm-elara", authorId: "me", type: "text", text: "Привет, Элара! Да, премия — это славно. Империя щедра", ts: min(126), status: "read" },
    { id: uid(), chatId: "dm-elara", authorId: "elara", type: "text", text: "Кстати, я внесла в Летопись твой вчерашний доклад. Одобрен Сенатом 📜", ts: min(124), status: "read", replyTo: "seed-el-1" },
    { id: "seed-el-1", chatId: "dm-elara", authorId: "me", type: "text", text: "Передал чертёж ретранслятора генералу Вальду", ts: min(123), status: "read" },
    { id: uid(), chatId: "dm-elara", authorId: "elara", type: "voice", text: "", ts: min(96), status: "read", att: { duration: 12 } },
    { id: uid(), chatId: "dm-elara", authorId: "me", type: "text", text: "Прослушал. Голос Летописи звучит как всегда вдохновенно 😄", ts: min(94), status: "read", edited: true },
    { id: uid(), chatId: "dm-elara", authorId: "me", type: "transfer", text: "За помощь с Летописью. Благодарю!", ts: min(92), status: "read", att: { price: 50 } },
    { id: uid(), chatId: "dm-elara", authorId: "elara", type: "text", text: "Ой, не стоило! Но Казначейство не спорит 🏛️ Вечером в комнате Авроры?", ts: min(88), status: "read" },
    { id: uid(), chatId: "dm-elara", authorId: "elara", type: "text", text: "И ещё: Юнна нашла старые карты провинций, покажу позже", ts: min(6), status: "delivered" },
  ],
  "dm-kassia": [
    { id: uid(), chatId: "dm-kassia", authorId: "kassia", type: "text", text: "Ночной дозор завершён. Всё спокойно 🛡️", ts: min(40), status: "read" },
    { id: uid(), chatId: "dm-kassia", authorId: "kassia", type: "text", text: "Если понадобишься — канал защищён, я на связи", ts: min(12), status: "delivered" },
  ],
  "dm-treasury": [
    { id: uid(), chatId: "dm-treasury", authorId: "treasury", type: "system", text: "Счёт HYPER активирован. Начислено стартовое жалование: 1200 HYPER", ts: day(2), status: "read" },
    { id: uid(), chatId: "dm-treasury", authorId: "treasury", type: "transfer", text: "Премия за активность «Голос Империи»", ts: hr(26), status: "read", att: { price: 50 } },
  ],
  "dm-dorian": [
    { id: uid(), chatId: "dm-dorian", authorId: "dorian", type: "text", text: "Гражданин, проверь настройки приватности. Стража рекомендует", ts: day(2), status: "read" },
    { id: uid(), chatId: "dm-dorian", authorId: "me", type: "text", text: "Проверил, всё в порядке. Благодарю за бдительность", ts: day(2), status: "read" },
  ],
  "g-circle": [
    { id: uid(), chatId: "g-circle", authorId: "livia", type: "text", text: "Круг созван. Тема: логистика караванов между Авророй и Вегой", ts: hr(5), status: "read" },
    { id: uid(), chatId: "g-circle", authorId: "toren", type: "text", text: "Аврора готова выделить два конвоя. Нужна эскорт-Стража", ts: hr(4), status: "read" },
    { id: uid(), chatId: "g-circle", authorId: "dorian", type: "text", text: "Вега даст Стражу. Дориан Кетт лично поведу колонну", ts: hr(4), status: "read", edited: true },
    { id: uid(), chatId: "g-circle", authorId: "kassia", type: "text", text: "Ночной дозор прикроет перевал. @Ливия, нужен допуск к Вратам", ts: hr(3), status: "read" },
    { id: uid(), chatId: "g-circle", authorId: "livia", type: "text", text: "Допуск выдан. Летопись зафиксировала решение ⚜️", ts: hr(3), status: "read" },
  ],
  "c-aurora": [
    { id: uid(), chatId: "c-aurora", authorId: "toren", type: "system", text: "Комната провинции Аврора создана автоматически Указом №201 «О связи провинций»", ts: day(30), status: "read" },
    { id: uid(), chatId: "c-aurora", authorId: "yunna", type: "text", text: "Нашла фрагмент старой карты за Вратами! Завтра покажу в архиве", ts: min(150), status: "read" },
    { id: uid(), chatId: "c-aurora", authorId: "markus", type: "text", text: "Кристаллы памяти подешевели на 12%. Налетай, граждане 🪙", ts: min(75), status: "read" },
    { id: uid(), chatId: "c-aurora", authorId: "elara", type: "text", text: "@Юнна неси карту сразу в Летопись, это же сенсация!", ts: min(70), status: "read" },
    { id: uid(), chatId: "c-aurora", authorId: "toren", type: "voice", text: "", ts: min(35), status: "read", att: { duration: 27 } },
    { id: uid(), chatId: "c-aurora", authorId: "rik", type: "file", text: "", ts: min(20), status: "delivered", att: { name: "Карта_провинций_Гипериона.pdf", size: "2,4 МБ" } },
  ],
  "c-vega": [
    { id: uid(), chatId: "c-vega", authorId: "kassia", type: "system", text: "Комната провинции Вега создана автоматически Указом №201 «О связи провинций»", ts: day(30), status: "read" },
    { id: uid(), chatId: "c-vega", authorId: "pip", type: "text", text: "Всем привет! Я новенький. Подскажите, где получить герб новичка?", ts: hr(28), status: "read" },
    { id: uid(), chatId: "c-vega", authorId: "dorian", type: "text", text: "@Пип в Летописи, раздел «Символы». Добро пожаловать в Вегу", ts: hr(27), status: "read" },
  ],
  "g-fest": [
    { id: uid(), chatId: "g-fest", authorId: "yunna", type: "text", text: "День Основания удался! Архив закрыт до следующего цикла 🎉", ts: day(9), status: "read" },
    { id: "seed-del-1", chatId: "g-fest", authorId: "pip", type: "text", text: "", ts: day(9), status: "read", deleted: true },
  ],
});
