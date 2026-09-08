import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import type { AppState, Chat, Message, MsgKind, Session, Settings, Toast, UIState } from "./types";
import {
  AWARDS,
  BANNED_WORDS,
  EDICTS,
  LAWS,
  MARKET_ITEMS,
  seedChats,
  seedCitizens,
  seedMessages,
} from "./data/seed";

const LS_KEY = "imperium-link-v3";
const ME = "HIT-77777";
let idSeq = 0;
const uid = () => `m${Date.now().toString(36)}${(idSeq++).toString(36)}`;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ================= звук ================= */
let actx: AudioContext | null = null;
function tone(freq: number, dur: number, delay: number, type: OscillatorType, vol: number) {
  try {
    actx = actx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* тишина Империи */
  }
}
const sfx = {
  send: (on: boolean) => on && (tone(740, 0.08, 0, "sine", 0.05), tone(1180, 0.1, 0.07, "sine", 0.04)),
  receive: (on: boolean) => on && (tone(540, 0.09, 0, "sine", 0.05), tone(720, 0.12, 0.08, "sine", 0.045)),
  award: (on: boolean) =>
    on && [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, i * 0.09, "triangle", 0.05)),
  coin: (on: boolean) => on && (tone(988, 0.09, 0, "square", 0.03), tone(1319, 0.14, 0.08, "square", 0.025)),
  error: (on: boolean) => on && tone(170, 0.22, 0, "sawtooth", 0.04),
};

/* ================= helpers ================= */
export function fmtClock(ts: number) {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
export function fmtDay(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(today.getTime() - 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Сегодня";
  if (same(d, yest)) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}
export function presenceLabel(c: { presence: string; lastSeen: number }) {
  if (c.presence === "online") return "в сети";
  if (c.presence === "recent") return "был(а) недавно";
  return `был(а) в ${fmtClock(c.lastSeen)}`;
}
export function lightLevel(light: number) {
  const tiers = [
    { name: "Искра", at: 0 },
    { name: "Факел", at: 100 },
    { name: "Заря", at: 250 },
    { name: "Сияние", at: 500 },
    { name: "Вечное Пламя", at: 1000 },
  ];
  let idx = 0;
  for (let i = 0; i < tiers.length; i++) if (light >= tiers[i].at) idx = i;
  const cur = tiers[idx];
  const next = tiers[idx + 1] ?? null;
  const pct = next ? Math.min(100, Math.round(((light - cur.at) / (next.at - cur.at)) * 100)) : 100;
  return { name: cur.name, next: next?.name ?? null, pct, light };
}

/* ================= reducer ================= */
type Action =
  | { type: "session/set"; session: Session }
  | { type: "logout" }
  | { type: "openChat"; chatId: string }
  | { type: "closeChat" }
  | { type: "ui"; patch: Partial<UIState> }
  | { type: "send"; chatId: string; msg: Message }
  | { type: "msgStatus"; chatId: string; msgId: string; status: Message["status"] }
  | { type: "receive"; chatId: string; msg: Message }
  | { type: "edit"; chatId: string; msgId: string; text: string }
  | { type: "remove"; chatId: string; msgId: string }
  | { type: "chatToggle"; chatId: string; key: "pinned" | "muted" | "archived" }
  | { type: "typing"; chatId: string; who: string | null }
  | { type: "presence"; id: string; presence: "online" | "offline" | "recent" }
  | { type: "toast/add"; toast: Toast }
  | { type: "toast/remove"; id: number }
  | { type: "transfer"; chatId: string; msg: Message; amount: number }
  | { type: "purchase"; price: number; light: number }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "createChat"; chat: Chat };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "session/set":
      return { ...s, session: a.session };
    case "logout":
      return { ...s, session: null, ui: initialUI(), toasts: [] };
    case "openChat":
      return {
        ...s,
        ui: { ...s.ui, activeChatId: a.chatId, replyTo: null, editingId: null },
        unread: { ...s.unread, [a.chatId]: 0 },
      };
    case "closeChat":
      return { ...s, ui: { ...s.ui, activeChatId: null, replyTo: null, editingId: null } };
    case "ui":
      return { ...s, ui: { ...s.ui, ...a.patch } };
    case "send": {
      const list = [...(s.messages[a.chatId] ?? []), a.msg];
      const newCount = s.sentCount + 1;
      const earned = AWARDS.filter((aw) => !s.awards.includes(aw.id) && newCount >= aw.need);
      const awardToasts: Toast[] = earned.map((aw) => ({
        id: ++toastSeq,
        kind: "award",
        title: `Награда Империи: ${aw.emoji} ${aw.name}`,
        text: aw.desc + " • Уровень Света +10",
      }));
      return {
        ...s,
        messages: { ...s.messages, [a.chatId]: list },
        sentCount: newCount,
        light: s.light + 3 + earned.length * 10,
        awards: [...s.awards, ...earned.map((x) => x.id)],
        toasts: [...s.toasts, ...awardToasts],
      };
    }
    case "msgStatus":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) => (m.id === a.msgId ? { ...m, status: a.status } : m)),
        },
      };
    case "receive": {
      const withMsg = [...(s.messages[a.chatId] ?? []), a.msg];
      const list = a.msg.mine
        ? withMsg
        : withMsg.map((m) =>
            m.mine && (m.status === "sent" || m.status === "delivered") ? { ...m, status: "read" as const } : m
          );
      const active = s.ui.activeChatId === a.chatId;
      return {
        ...s,
        messages: { ...s.messages, [a.chatId]: list },
        unread: active ? s.unread : { ...s.unread, [a.chatId]: (s.unread[a.chatId] ?? 0) + 1 },
      };
    }
    case "edit":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) => (m.id === a.msgId ? { ...m, text: a.text, edited: true } : m)),
        },
        ui: { ...s.ui, editingId: null, replyTo: null },
      };
    case "remove":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) =>
            m.id === a.msgId ? { ...m, deleted: true, text: "", image: undefined, file: undefined, voice: undefined } : m
          ),
        },
      };
    case "chatToggle":
      return {
        ...s,
        chats: { ...s.chats, [a.chatId]: { ...s.chats[a.chatId], [a.key]: !s.chats[a.chatId][a.key] } },
      };
    case "typing":
      return { ...s, typing: { ...s.typing, [a.chatId]: a.who } };
    case "presence":
      return {
        ...s,
        citizens: {
          ...s.citizens,
          [a.id]: { ...s.citizens[a.id], presence: a.presence, lastSeen: a.presence === "online" ? s.citizens[a.id].lastSeen : Date.now() },
        },
      };
    case "toast/add":
      return { ...s, toasts: [...s.toasts.slice(-3), a.toast] };
    case "toast/remove":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "transfer":
      return {
        ...s,
        balance: s.balance - a.amount,
        messages: { ...s.messages, [a.chatId]: [...(s.messages[a.chatId] ?? []), a.msg] },
      };
    case "purchase":
      return { ...s, balance: s.balance - a.price, light: s.light + a.light };
    case "settings":
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case "createChat":
      return { ...s, chats: { ...s.chats, [a.chat.id]: a.chat }, messages: { ...s.messages, [a.chat.id]: [] } };
    default:
      return s;
  }
}

let toastSeq = 100;

const initialUI = (): UIState => ({
  activeChatId: null,
  replyTo: null,
  editingId: null,
  forwardMsg: null,
  modal: null,
  modalChatId: null,
  reportTarget: null,
  citizenId: null,
});

function freshState(): AppState {
  return {
    session: null,
    citizens: seedCitizens(),
    chats: seedChats(),
    messages: seedMessages(),
    unread: { "dm-liria": 1, "ch-law": 1, "ch-emperor": 1 },
    typing: {},
    ui: initialUI(),
    toasts: [],
    balance: 1250,
    light: 342,
    awards: ["a1"],
    sentCount: 1,
    settings: { sound: true, push: true },
  };
}

function init(): AppState {
  const base = freshState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (saved.key !== LS_KEY) return base;
    let session: Session | null = saved.session ?? null;
    if (session && session.expiresAt < Date.now()) session = null;
    return {
      ...base,
      session,
      chats: { ...base.chats, ...(saved.chats ?? {}) },
      messages: { ...base.messages, ...(saved.messages ?? {}) },
      unread: { ...(saved.unread ?? base.unread) },
      balance: saved.balance ?? base.balance,
      light: saved.light ?? base.light,
      awards: saved.awards ?? base.awards,
      sentCount: saved.sentCount ?? base.sentCount,
      settings: { ...base.settings, ...(saved.settings ?? {}) },
    };
  } catch {
    return base;
  }
}

/* ================= context ================= */
export interface SendPayload {
  text?: string;
  kind?: MsgKind;
  image?: string;
  file?: { name: string; size: string };
  voice?: { duration: number; waveform: number[] };
  replyTo?: string;
}

interface Ctx {
  state: AppState;
  a: ReturnType<typeof buildActions>;
}

const StoreCtx = createContext<Ctx | null>(null);

function buildActions(
  dispatch: React.Dispatch<Action>,
  ref: React.MutableRefObject<AppState>
) {
  let timers: number[] = [];
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.push(t);
  };

  const toast = (kind: Toast["kind"], title: string, text: string) =>
    dispatch({ type: "toast/add", toast: { id: ++toastSeq, kind, title, text } });

  const soundOn = () => ref.current.settings.sound;

  /* доставка входящего с уведомлениями */
  function deliver(chatId: string, msg: Message) {
    const s = ref.current;
    const chat = s.chats[chatId];
    dispatch({ type: "receive", chatId, msg });
    if (!chat) return;
    const active = s.ui.activeChatId === chatId;
    const author = s.citizens[msg.authorId];
    const meName = s.citizens[ME]?.name ?? "";
    if (!active && s.settings.push && !chat.muted) {
      const preview =
        msg.kind === "text" ? msg.text : msg.kind === "image" ? "📷 Фотография" : msg.kind === "voice" ? "🎙 Голосовое сообщение" : msg.kind === "law" ? msg.text : msg.kind === "edict" ? "👑 Указ Императора" : "Новое сообщение";
      toast("push", `${chat.emoji} ${chat.title}`, `${author?.name ?? ""}: ${preview}`.slice(0, 90));
    }
    if (msg.text.includes("@" + meName.split(" ")[0]) || msg.text.includes("@" + meName)) {
      toast("mention", "Упоминание", `${author?.name ?? "Кто-то"} упомянул вас в «${chat.title}»`);
    }
    sfx.receive(soundOn());
  }

  /* scheduleReply удалена — только государственные каналы */

  return {
    toast,
    dismissToast: (id: number) => dispatch({ type: "toast/remove", id }),

    completeLogin(citizenId: string) {
      const session: Session = { citizenId, issuedAt: Date.now(), expiresAt: Date.now() + 24 * 3600_000 };
      dispatch({ type: "session/set", session });
      dispatch({ type: "presence", id: citizenId, presence: "online" });
      toast("success", "Врата открыты", "С возвращением, Страж Аларик Вейлан. Связь защищена.");
      sfx.award(soundOn());
    },

    logout() {
      timers.forEach(clearTimeout);
      timers = [];
      dispatch({ type: "logout" });
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          saved.session = null;
          localStorage.setItem(LS_KEY, JSON.stringify(saved));
        }
      } catch { /* noop */ }
    },

    openChat(chatId: string) {
      dispatch({ type: "openChat", chatId });
    },
    closeChat() {
      dispatch({ type: "closeChat" });
    },
    ui(patch: Partial<UIState>) {
      dispatch({ type: "ui", patch });
    },

    sendMessage(chatId: string, payload: SendPayload): boolean {
      const s = ref.current;
      const text = payload.text ?? "";
      if (payload.kind === "text" || payload.kind === undefined) {
        const low = text.toLowerCase();
        const bad = BANNED_WORDS.find((w) => low.includes(w));
        if (bad) {
          toast("warning", "ИИ-ОКО: сообщение заблокировано", `Обнаружено запрещённое слово «${bad}». Нарушение закона HYR-125. Сообщение не отправлено.`);
          sfx.error(soundOn());
          return false;
        }
        if (text.replace(/\s/g, "").length === 0) return false;
      }
      const msg: Message = {
        id: uid(),
        chatId,
        authorId: ME,
        kind: payload.kind ?? "text",
        text,
        ts: Date.now(),
        status: "sending",
        mine: true,
        replyTo: payload.replyTo,
        image: payload.image,
        file: payload.file,
        voice: payload.voice,
      };
      dispatch({ type: "send", chatId, msg });
      dispatch({ type: "ui", patch: { replyTo: null } });
      sfx.send(soundOn());
      later(() => dispatch({ type: "msgStatus", chatId, msgId: msg.id, status: "sent" }), 380);
      later(() => dispatch({ type: "msgStatus", chatId, msgId: msg.id, status: "delivered" }), 1100);
      return true;
    },

    editMessage(chatId: string, msgId: string, text: string) {
      const s = ref.current;
      const msg = (s.messages[chatId] ?? []).find((x) => x.id === msgId);
      if (!msg) return;
      if (Date.now() - msg.ts > 5 * 60_000) {
        toast("warning", "Время вышло", "Редактирование доступно только в течение 5 минут после отправки.");
        sfx.error(soundOn());
        return;
      }
      const bad = BANNED_WORDS.find((w) => text.toLowerCase().includes(w));
      if (bad) {
        toast("warning", "ИИ-ОКО: правка заблокирована", `Запрещённое слово «${bad}». Изменение отклонено.`);
        sfx.error(soundOn());
        return;
      }
      dispatch({ type: "edit", chatId, msgId, text });
    },

    deleteMessage(chatId: string, msgId: string) {
      dispatch({ type: "remove", chatId, msgId });
      toast("info", "Сообщение удалено", "Пометка «удалено» видна всем участникам чата.");
    },

    forwardTo(chatId: string) {
      const s = ref.current;
      const src = s.ui.forwardMsg;
      if (!src) return;
      const msg: Message = {
        ...src,
        id: uid(),
        chatId,
        authorId: ME,
        mine: true,
        ts: Date.now(),
        status: "sending",
        edited: false,
        deleted: false,
        replyTo: undefined,
      };
      dispatch({ type: "send", chatId, msg });
      dispatch({ type: "ui", patch: { forwardMsg: null, modal: null } });
      toast("success", "Переслано", `Сообщение доставлено в «${s.chats[chatId]?.title ?? "чат"}»`);
      later(() => dispatch({ type: "msgStatus", chatId, msgId: msg.id, status: "sent" }), 380);
      later(() => dispatch({ type: "msgStatus", chatId, msgId: msg.id, status: "delivered" }), 1100);
      sfx.send(soundOn());
    },

    transferTo(chatId: string, amount: number, note: string) {
      const s = ref.current;
      if (!Number.isFinite(amount) || amount <= 0) {
        toast("warning", "Казначейство", "Укажите сумму больше нуля.");
        return false;
      }
      if (amount > s.balance) {
        toast("warning", "Казначейство", "Недостаточно HYPER на балансе.");
        sfx.error(soundOn());
        return false;
      }
      const msg: Message = {
        id: uid(),
        chatId,
        authorId: ME,
        kind: "transfer",
        text: "",
        ts: Date.now(),
        status: "read",
        mine: true,
        transfer: { amount, note: note.trim() || undefined },
      };
      dispatch({ type: "transfer", chatId, msg, amount });
      dispatch({ type: "ui", patch: { modal: null, modalChatId: null } });
      toast("success", "Перевод выполнен 💰", `${amount} HYPER отправлено через Казначейство Империи. Пошлина 0%.`);
      sfx.coin(soundOn());
      return true;
    },

    topUp(amount: number) {
      dispatch({ type: "purchase", price: -amount, light: 0 });
      toast("success", "Казначейство Империи 💰", `Счёт пополнен на ${amount} HYPER (демо-грант Сената).`);
      sfx.coin(soundOn());
    },

    buyItem(itemId: string) {
      const s = ref.current;
      const item = MARKET_ITEMS.find((i) => i.id === itemId);
      if (!item) return;
      if (s.balance < item.price) {
        toast("warning", "Рынок Гипериона", `Недостаточно HYPER: нужно ${item.price}, у вас ${s.balance}.`);
        sfx.error(soundOn());
        return;
      }
      dispatch({ type: "purchase", price: item.price, light: item.id === "mi1" ? 25 : 5 });
      toast("success", `Куплено: ${item.emoji} ${item.name}`, item.desc + (item.id === "mi1" ? " • Свет +25" : ""));
      sfx.coin(soundOn());
    },

    report(msgId: string, reason: string) {
      dispatch({ type: "ui", patch: { modal: null, reportTarget: null } });
      toast("success", "Жалоба передана Страже 🛡", `Причина: ${reason}. Модераторы рассмотрят её в течение часа.`);
    },

    toggleChat(chatId: string, key: "pinned" | "muted" | "archived") {
      const s = ref.current;
      const chat = s.chats[chatId];
      dispatch({ type: "chatToggle", chatId, key });
      if (key === "archived") {
        toast("info", chat.archived ? "Чат возвращён из архива" : "Чат в архиве", chat.title);
      }
    },



    setSettings(patch: Partial<Settings>) {
      dispatch({ type: "settings", patch });
    },
  };
}

/* ================= provider ================= */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const ref = useRef(state);
  ref.current = state;

  const a = useMemo(() => buildActions(dispatch, ref), []);

  /* сохранение */
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({
            key: LS_KEY,
            session: state.session,
            chats: state.chats,
            messages: state.messages,
            unread: state.unread,
            balance: state.balance,
            light: state.light,
            awards: state.awards,
            sentCount: state.sentCount,
            settings: state.settings,
          })
        );
      } catch { /* хранилище переполнено — Империя простит */ }
    }, 350);
    return () => clearTimeout(t);
  }, [state]);

  /* ==== симуляция реального времени (WebSocket) ==== */
  useEffect(() => {
    if (!state.session) return;
    const handles: number[] = [];
    const later = (fn: () => void, ms: number) => handles.push(window.setTimeout(fn, ms));
    const every = (fn: () => void, ms: number) => handles.push(window.setInterval(fn, ms));
    const s = ref.current;

    const botDeliver = (chatId: string, authorId: string, text: string, kind: MsgKind = "text") => {
      dispatch({ type: "typing", chatId, who: authorId });
      later(() => {
        dispatch({ type: "typing", chatId, who: null });
        const st = ref.current;
        const chat = st.chats[chatId];
        if (!chat) return;
        const msg: Message = { id: uid(), chatId, authorId, kind, text, ts: Date.now(), status: "read" };
        dispatch({ type: "receive", chatId, msg });
        const active = st.ui.activeChatId === chatId;
        const author = st.citizens[authorId];
        if (!active && st.settings.push && !chat.muted) {
          toastPush(chat.emoji + " " + chat.title, `${author?.name ?? ""}: ${text}`.slice(0, 90));
        }
        sfx.receive(st.settings.sound);
      }, 1800);
    };
    const toastPush = (title: string, text: string) =>
      dispatch({ type: "toast/add", toast: { id: ++toastSeq, kind: "push", title, text } });

    /* присутствие */
    every(() => {
      const st = ref.current;
      const ids = Object.keys(st.citizens).filter((id) => id !== ME && id !== "HIT-00001" && id !== "HIT-00010");
      const id = pick(ids);
      const cur = st.citizens[id].presence;
      const next = cur === "online" ? (Math.random() > 0.5 ? "recent" : "offline") : "online";
      dispatch({ type: "presence", id, presence: next });
    }, 14_000);

    /* указы и законы от Императора */
    later(() => botDeliver("ch-emperor", "HIT-00001", pick(EDICTS), "edict"), 38_000);
    later(() => botDeliver("ch-law", "HIT-00010", pick(LAWS), "law"), 80_000);
    every(() => botDeliver("ch-law", "HIT-00010", pick(LAWS), "law"), 170_000);

    return () => handles.forEach((h) => {
      clearTimeout(h);
      clearInterval(h);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session?.citizenId]);

  return <StoreCtx.Provider value={{ state, a }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
