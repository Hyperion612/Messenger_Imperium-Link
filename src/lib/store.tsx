import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ReactNode } from "react";
import {
  AMBIENT, AWARDS, EDICTS, FAKE_FILES, GENERIC_REPLIES, LAWS, PERSONAL_REPLIES,
  filterBanned, fmtTime, lightLevel, plural, seedChats, seedCitizens, seedMessages, uid,
} from "./data";
import type { Attachment, Chat, Citizen, Message, MsgStatus, MsgType, Toast, UserMeta } from "./data";

export interface SessionUser {
  id: "me";
  hit: string;
  name: string;
  loggedInAt: number;
  sessionExpires: number;
}

export interface State {
  user: SessionUser | null;
  meta: UserMeta;
  citizens: Record<string, Citizen>;
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  typing: Record<string, string | null>;
  toasts: Toast[];
  soundOn: boolean;
  flash: { chatId: string; msgId: string } | null;
  offline: boolean;
}

type Action =
  | { t: "SET_USER"; user: SessionUser | null }
  | { t: "SELECT"; id: string | null }
  | { t: "SEND"; msg: Message }
  | { t: "RECEIVE"; msg: Message }
  | { t: "MSG_STATUS"; chatId: string; status: MsgStatus }
  | { t: "EDIT"; chatId: string; id: string; text: string }
  | { t: "DELETE"; chatId: string; id: string }
  | { t: "MARK_SOLD"; chatId: string; id: string }
  | { t: "TYPING"; chatId: string; userId: string | null }
  | { t: "PRESENCE"; id: string; online: boolean }
  | { t: "MARK_READ"; chatId: string; ts: number }
  | { t: "CHAT_META"; chatId: string; patch: Partial<Chat> }
  | { t: "CLEAR_HISTORY"; chatId: string }
  | { t: "LEAVE"; chatId: string }
  | { t: "BALANCE"; delta: number }
  | { t: "REP"; delta: number }
  | { t: "COUNTER"; key: "msgs" | "transfers" | "purchases" | "reports" }
  | { t: "AWARD"; id: string }
  | { t: "TOAST_ADD"; toast: Toast }
  | { t: "TOAST_DEL"; id: number }
  | { t: "SOUND"; on: boolean }
  | { t: "FLASH"; v: { chatId: string; msgId: string } | null }
  | { t: "OFFLINE"; v: boolean };

const DATA_KEY = "imperium-link.data.v1";
const SESSION_KEY = "imperium-link.session.v1";
const ICON_URL = "https://image.qwenlm.ai/generated-images/d48f1dca-04eb-475a-8155-934c8437af74/_result.png";

function defaultMeta(): UserMeta {
  return { hyper: 1250, rep: 34, awards: ["first-word"], msgs: 1, transfers: 1, purchases: 0, reports: 0 };
}

function loadData(): Pick<State, "chats" | "messages" | "meta"> {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.chats && d.messages && d.meta) return d;
    }
  } catch { /* повреждённый кэш — пересоздаём */ }
  return { chats: seedChats(), messages: seedMessages(), meta: defaultMeta() };
}

function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.hit && u.sessionExpires > Date.now()) return u;
      localStorage.removeItem(SESSION_KEY);
    }
  } catch { /* ignore */ }
  return null;
}

function initState(): State {
  const d = loadData();
  const citizens = seedCitizens();
  // свежее присутствие при загрузке
  Object.values(citizens).forEach((c) => {
    if (["elara", "toren", "yunna", "pip"].includes(c.id)) { c.online = true; c.lastSeen = Date.now(); }
  });
  return {
    user: loadSession(),
    meta: d.meta,
    citizens,
    chats: d.chats,
    messages: d.messages,
    activeChatId: null,
    typing: {},
    toasts: [],
    soundOn: true,
    flash: null,
    offline: !navigator.onLine,
  };
}

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "SET_USER": return { ...s, user: a.user };
    case "SELECT": return { ...s, activeChatId: a.id };
    case "SEND":
    case "RECEIVE": {
      const list = s.messages[a.msg.chatId] ?? [];
      const typing = { ...s.typing };
      if (a.t === "RECEIVE" && typing[a.msg.chatId] === a.msg.authorId) typing[a.msg.chatId] = null;
      return { ...s, messages: { ...s.messages, [a.msg.chatId]: [...list, a.msg] }, typing };
    }
    case "MSG_STATUS": {
      const order: Record<MsgStatus, number> = { sent: 0, delivered: 1, read: 2 };
      const list = (s.messages[a.chatId] ?? []).map((m) =>
        m.authorId === "me" && order[m.status] < order[a.status] ? { ...m, status: a.status } : m
      );
      return { ...s, messages: { ...s.messages, [a.chatId]: list } };
    }
    case "EDIT":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) => (m.id === a.id ? { ...m, text: a.text, edited: true } : m)),
        },
      };
    case "DELETE":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) => (m.id === a.id ? { ...m, deleted: true, text: "", att: undefined } : m)),
        },
      };
    case "MARK_SOLD":
      return {
        ...s,
        messages: {
          ...s.messages,
          [a.chatId]: (s.messages[a.chatId] ?? []).map((m) => (m.id === a.id && m.att ? { ...m, att: { ...m.att, sold: true } } : m)),
        },
      };
    case "TYPING": return { ...s, typing: { ...s.typing, [a.chatId]: a.userId } };
    case "PRESENCE": {
      const c = s.citizens[a.id];
      if (!c) return s;
      return { ...s, citizens: { ...s.citizens, [a.id]: { ...c, online: a.online, lastSeen: a.online ? Date.now() : c.lastSeen } } };
    }
    case "MARK_READ":
      return { ...s, chats: s.chats.map((c) => (c.id === a.chatId ? { ...c, lastReadAt: Math.max(c.lastReadAt, a.ts) } : c)) };
    case "CHAT_META":
      return { ...s, chats: s.chats.map((c) => (c.id === a.chatId ? { ...c, ...a.patch } : c)) };
    case "CLEAR_HISTORY": return { ...s, messages: { ...s.messages, [a.chatId]: [] } };
    case "LEAVE": {
      const messages = { ...s.messages };
      delete messages[a.chatId];
      return {
        ...s,
        chats: s.chats.filter((c) => c.id !== a.chatId),
        messages,
        activeChatId: s.activeChatId === a.chatId ? null : s.activeChatId,
      };
    }
    case "BALANCE": return { ...s, meta: { ...s.meta, hyper: Math.max(0, s.meta.hyper + a.delta) } };
    case "REP": return { ...s, meta: { ...s.meta, rep: Math.max(0, s.meta.rep + a.delta) } };
    case "COUNTER": return { ...s, meta: { ...s.meta, [a.key]: s.meta[a.key] + 1 } };
    case "AWARD": return s.meta.awards.includes(a.id) ? s : { ...s, meta: { ...s.meta, awards: [...s.meta.awards, a.id] } };
    case "TOAST_ADD": return { ...s, toasts: [...s.toasts.slice(-3), a.toast] };
    case "TOAST_DEL": return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case "SOUND": return { ...s, soundOn: a.on };
    case "FLASH": return { ...s, flash: a.v };
    case "OFFLINE": return { ...s, offline: a.v };
  }
}

// ─── Контекст и API ──────────────────────────────────────────────────────
export interface Api {
  toast: (kind: Toast["kind"], title: string, body?: string, chatId?: string, icon?: string) => void;
  dismissToast: (id: number) => void;
  chime: (kind: "msg" | "send" | "warn" | "award") => void;
  login: (name: string, hit: string) => void;
  logout: (reason?: string) => void;
  selectChat: (id: string | null) => void;
  markRead: (chatId: string) => void;
  sendMessage: (chatId: string, opts: { type?: MsgType; text?: string; replyTo?: string; att?: Attachment }) => boolean;
  editMessage: (chatId: string, id: string, text: string) => void;
  deleteMessage: (chatId: string, id: string) => void;
  forward: (msgId: string, fromChat: string, toChat: string) => void;
  report: (chatId: string, msgId: string) => void;
  transfer: (chatId: string, amount: number, note: string) => void;
  buy: (chatId: string, msgId: string, price: number, name: string) => void;
  topUp: () => void;
  sendImage: (chatId: string, url: string, name: string) => void;
  sendDoc: (chatId: string) => void;
  sendVoice: (chatId: string, url: string | null, duration: number) => void;
  togglePin: (id: string) => void;
  toggleMute: (id: string) => void;
  toggleArchive: (id: string) => void;
  clearHistory: (id: string) => void;
  leaveChat: (id: string) => void;
  setSound: (on: boolean) => void;
  flash: (chatId: string, msgId: string) => void;
  clearFlash: () => void;
}

const Ctx = createContext<{ state: State; api: Api } | null>(null);

export const useImperium = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("ImperiumProvider missing");
  return v;
};

let audioCtx: AudioContext | null = null;
function tone(freq: number, dur: number, delay: number, type: OscillatorType = "sine", gain = 0.05) {
  if (!audioCtx) audioCtx = new AudioContext();
  const t0 = audioCtx.currentTime + delay;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

export function ImperiumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const sendsRef = useRef<number[]>([]);
  const pendingRef = useRef<{ id: string; chatId: string }[]>([]);
  const edictIdx = useRef(2);
  const lawIdx = useRef(2);
  const toastId = useRef(1);

  // персистентность
  useEffect(() => {
    const h = window.setTimeout(() => {
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify({ chats: state.chats, messages: state.messages, meta: state.meta }));
      } catch { /* quota */ }
    }, 600);
    return () => clearTimeout(h);
  }, [state.chats, state.messages, state.meta]);

  useEffect(() => {
    try {
      if (state.user) localStorage.setItem(SESSION_KEY, JSON.stringify(state.user));
      else localStorage.removeItem(SESSION_KEY);
    } catch { /* ignore */ }
  }, [state.user]);

  const api = useMemo<Api>(() => {
    const t = (fn: () => void, ms: number) => window.setTimeout(fn, ms);
    const guard = () => !!stateRef.current.user;

    const toast: Api["toast"] = (kind, title, body, chatId, icon) => {
      const id = toastId.current++;
      dispatch({ t: "TOAST_ADD", toast: { id, kind, title, body, chatId, icon } });
      t(() => dispatch({ t: "TOAST_DEL", id }), 5000);
    };

    const chime: Api["chime"] = (kind) => {
      if (!stateRef.current.soundOn) return;
      try {
        if (kind === "msg") { tone(880, 0.1, 0); tone(1174.7, 0.14, 0.09); }
        if (kind === "send") { tone(587, 0.07, 0, "triangle", 0.035); }
        if (kind === "warn") { tone(233, 0.16, 0, "sawtooth", 0.03); tone(196, 0.18, 0.12, "sawtooth", 0.03); }
        if (kind === "award") { tone(659, 0.12, 0); tone(830, 0.12, 0.11); tone(988, 0.2, 0.22); }
        navigator.vibrate?.(24);
      } catch { /* audio недоступен */ }
    };

    const notify = (title: string, body: string) => {
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          new Notification(title, { body, icon: ICON_URL });
        }
      } catch { /* ignore */ }
    };

    const checkAwards = () => {
      const m = stateRef.current.meta;
      const grants: [boolean, string][] = [
        [m.msgs >= 1, "first-word"], [m.msgs >= 25, "voice"], [m.msgs >= 100, "herald"],
        [m.transfers >= 1, "patron"], [m.reports >= 1, "keeper"], [m.purchases >= 1, "merchant"],
        [lightLevel(m.rep).idx >= 2, "light"],
      ];
      grants.forEach(([ok, id]) => {
        if (ok && !stateRef.current.meta.awards.includes(id)) {
          dispatch({ t: "AWARD", id });
          const a = AWARDS.find((x) => x.id === id);
          if (a) { toast("success", `Награда Империи: «${a.name}»`, a.desc, undefined, a.icon); chime("award"); }
        }
      });
    };

    const incoming = (chatId: string, authorId: string, type: MsgType, text: string, att?: Attachment) => {
      if (!guard()) return;
      const msg: Message = { id: uid(), chatId, authorId, type, text, ts: Date.now(), status: "read", att };
      dispatch({ t: "RECEIVE", msg });
      const st = stateRef.current;
      const chat = st.chats.find((c) => c.id === chatId);
      const author = st.citizens[authorId];
      const active = st.activeChatId === chatId && document.visibilityState === "visible";
      if (active) dispatch({ t: "MARK_READ", chatId, ts: Date.now() });
      if (!chat?.muted && !active) {
        const authorName = authorId === "me" ? st.user?.name ?? "" : author?.name ?? "Империя";
        toast("push", authorName, text.slice(0, 90) || (type === "voice" ? "🎙 Голосовое послание" : "Новое послание"), chatId);
        chime("msg");
        notify(authorName, text.slice(0, 110));
      }
    };

    const botReply = (chatId: string, userText: string) => {
      const st = stateRef.current;
      const chat = st.chats.find((c) => c.id === chatId);
      if (!chat || chat.readOnly) return;
      let responder: string | null = null;
      if (chat.kind === "dm") responder = chat.memberIds[0];
      else {
        const bots = chat.memberIds.filter((id) => st.citizens[id]);
        responder = bots[Math.floor(Math.random() * bots.length)] ?? null;
      }
      if (!responder) return;
      const citizen = st.citizens[responder];
      if (!citizen.online && Math.random() < 0.5) return;
      const delay = 900 + Math.random() * 900;
      const typingMs = Math.min(3200, 1300 + userText.length * 18 + Math.random() * 600);
      t(() => {
        if (!guard()) return;
        dispatch({ t: "TYPING", chatId, userId: responder });
        dispatch({ t: "MSG_STATUS", chatId, status: "read" });
        t(() => {
          if (!guard()) return;
          const pool = PERSONAL_REPLIES[responder!] ?? GENERIC_REPLIES;
          let text = pool[Math.floor(Math.random() * pool.length)];
          const short = userText.trim().length > 0 && userText.trim().length < 60;
          if (short && Math.random() < 0.3) text = `«${userText.trim()}» — ${text.toLowerCase()}`;
          incoming(chatId, responder!, "text", text);
        }, typingMs);
      }, delay);
    };

    const sendMessage: Api["sendMessage"] = (chatId, opts) => {
      if (!guard()) return false;
      const nowMs = Date.now();
      sendsRef.current = [...sendsRef.current.filter((x) => nowMs - x < 3500), nowMs];
      if (sendsRef.current.length > 4) {
        toast("warn", "Защита от спама", "Слишком много посланий подряд. Империя просит перевести дух.");
        chime("warn");
        return false;
      }
      let text = opts.text ?? "";
      if (opts.type === "text" || opts.type === undefined) {
        const f = filterBanned(text);
        if (f.hit) {
          text = f.clean;
          dispatch({ t: "REP", delta: -2 });
          toast("warn", "Модерация Империи", "Запрещённое слово заменено Стражей. Уровень Света −2");
          chime("warn");
        }
      }
      const msg: Message = {
        id: uid(), chatId, authorId: "me", type: opts.type ?? "text", text, ts: nowMs,
        status: "sent", replyTo: opts.replyTo, att: opts.att,
      };
      dispatch({ t: "SEND", msg });
      dispatch({ t: "COUNTER", key: "msgs" });
      chime("send");
      checkAwards();
      if (navigator.onLine) {
        t(() => { if (guard()) dispatch({ t: "MSG_STATUS", chatId, status: "delivered" }); }, 350 + Math.random() * 300);
        botReply(chatId, text);
      } else {
        pendingRef.current.push({ id: msg.id, chatId });
        toast("info", "Оффлайн-режим", "Послание сохранено и уйдёт при восстановлении связи");
      }
      return true;
    };

    return {
      toast,
      dismissToast: (id) => dispatch({ t: "TOAST_DEL", id }),
      chime,
      login: (name, hit) => {
        const user: SessionUser = { id: "me", hit, name, loggedInAt: Date.now(), sessionExpires: Date.now() + 8 * 3600000 };
        dispatch({ t: "SET_USER", user });
        toast("success", "Связь установлена", `Добро пожаловать в Империю, ${name}. Канал зашифрован.`);
        chime("award");
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission().catch(() => {});
          }
        } catch { /* ignore */ }
      },
      logout: (reason) => {
        dispatch({ t: "SET_USER", user: null });
        dispatch({ t: "SELECT", id: null });
        if (reason) toast("warn", "Сессия завершена", reason);
      },
      selectChat: (id) => {
        dispatch({ t: "SELECT", id });
        if (id) dispatch({ t: "MARK_READ", chatId: id, ts: Date.now() });
      },
      markRead: (chatId) => dispatch({ t: "MARK_READ", chatId, ts: Date.now() }),
      sendMessage,
      editMessage: (chatId, id, text) => {
        const f = filterBanned(text);
        dispatch({ t: "EDIT", chatId, id, text: f.clean });
        toast("info", "Послание изменено", "Летопись обновлена");
      },
      deleteMessage: (chatId, id) => {
        dispatch({ t: "DELETE", chatId, id });
        toast("info", "Послание удалено", "След стёрт из Летописи");
      },
      forward: (msgId, fromChat, toChat) => {
        const src = stateRef.current.messages[fromChat]?.find((m) => m.id === msgId);
        const to = stateRef.current.chats.find((c) => c.id === toChat);
        if (!src || !to) return;
        const author = stateRef.current.citizens[src.authorId]?.name ?? stateRef.current.user?.name ?? "гражданин";
        const msg: Message = {
          id: uid(), chatId: toChat, authorId: "me", type: src.type, text: src.text, ts: Date.now(),
          status: "sent", att: src.att, forwardedFrom: author,
        };
        dispatch({ t: "SEND", msg });
        t(() => { if (guard()) dispatch({ t: "MSG_STATUS", chatId: toChat, status: "delivered" }); }, 400);
        toast("success", "Переслано", `Копия доставлена: ${to.title}`);
        chime("send");
      },
      report: (chatId, msgId) => {
        dispatch({ t: "COUNTER", key: "reports" });
        checkAwards();
        toast("success", "Жалоба принята", "Страж Дориан Кетт уведомлён. Порядок будет восстановлен.", chatId);
        chime("send");
        void msgId;
      },
      transfer: (chatId, amount, note) => {
        const st = stateRef.current;
        if (amount <= 0) { toast("warn", "Казначейство", "Сумма должна быть положительной"); return; }
        if (st.meta.hyper < amount) { toast("warn", "Казначейство", "Недостаточно HYPER на счёте"); chime("warn"); return; }
        dispatch({ t: "BALANCE", delta: -amount });
        dispatch({ t: "COUNTER", key: "transfers" });
        checkAwards();
        const msg: Message = { id: uid(), chatId, authorId: "me", type: "transfer", text: note || "Перевод HYPER", ts: Date.now(), status: "sent", att: { price: amount } };
        dispatch({ t: "SEND", msg });
        chime("send");
        toast("success", "Перевод исполнен", `${amount} HYPER скреплены печатью Казначейства`);
        t(() => { if (guard()) dispatch({ t: "MSG_STATUS", chatId, status: "read" }); }, 900);
        const chat = st.chats.find((c) => c.id === chatId);
        const targetName = chat?.kind === "dm" ? st.citizens[chat.memberIds[0]]?.name ?? "получатель" : "получатель";
        t(() => {
          if (!guard()) return;
          incoming("dm-treasury", "treasury", "system", `Квитанция №${Math.floor(1000 + Math.random() * 9000)}: списано ${amount} HYPER → ${targetName}. ${note ? "Назначение: " + note : ""}`);
        }, 1600);
      },
      buy: (chatId, msgId, price, name) => {
        const st = stateRef.current;
        if (st.meta.hyper < price) { toast("warn", "Казначейство", "Недостаточно HYPER для покупки"); chime("warn"); return; }
        dispatch({ t: "BALANCE", delta: -price });
        dispatch({ t: "MARK_SOLD", chatId, id: msgId });
        dispatch({ t: "COUNTER", key: "purchases" });
        checkAwards();
        chime("award");
        toast("success", "Сделка на Рынке", `«${name}» — ваш. Курьер Империи уже в пути.`, chatId);
        t(() => {
          if (!guard()) return;
          incoming("dm-treasury", "treasury", "system", `Чек Рынка №${Math.floor(1000 + Math.random() * 9000)}: покупка «${name}» за ${price} HYPER`);
        }, 1400);
      },
      topUp: () => {
        dispatch({ t: "BALANCE", delta: 500 });
        chime("award");
        toast("success", "Казначейство", "Жалование за цикл начислено: +500 HYPER");
        incoming("dm-treasury", "treasury", "system", "Начислено жалование за цикл: +500 HYPER. Баланс обновлён.");
      },
      sendImage: (chatId, url, name) => { sendMessage(chatId, { type: "image", att: { url, name } }); },
      sendDoc: (chatId) => {
        const f = FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)];
        sendMessage(chatId, { type: "file", att: { name: f.name, size: f.size } });
      },
      sendVoice: (chatId, url, duration) => { sendMessage(chatId, { type: "voice", att: { url: url ?? undefined, duration } }); },
      togglePin: (id) => {
        const c = stateRef.current.chats.find((x) => x.id === id);
        if (c) dispatch({ t: "CHAT_META", chatId: id, patch: { pinned: !c.pinned } });
      },
      toggleMute: (id) => {
        const c = stateRef.current.chats.find((x) => x.id === id);
        if (c) {
          dispatch({ t: "CHAT_META", chatId: id, patch: { muted: !c.muted } });
          toast("info", !c.muted ? "Уведомления отключены" : "Уведомления включены", c.title);
        }
      },
      toggleArchive: (id) => {
        const c = stateRef.current.chats.find((x) => x.id === id);
        if (c) {
          dispatch({ t: "CHAT_META", chatId: id, patch: { archived: !c.archived } });
          toast("info", !c.archived ? "Чат в архиве" : "Чат возвращён из архива", c.title);
        }
      },
      clearHistory: (id) => {
        dispatch({ t: "CLEAR_HISTORY", chatId: id });
        toast("info", "История очищена", "Летопись чата предана забвению");
      },
      leaveChat: (id) => {
        const c = stateRef.current.chats.find((x) => x.id === id);
        dispatch({ t: "LEAVE", chatId: id });
        if (c) toast("info", "Вы покинули чат", c.title);
      },
      setSound: (on) => dispatch({ t: "SOUND", on }),
      flash: (chatId, msgId) => {
        dispatch({ t: "SELECT", id: chatId });
        dispatch({ t: "MARK_READ", chatId, ts: Date.now() });
        dispatch({ t: "FLASH", v: { chatId, msgId } });
        t(() => dispatch({ t: "FLASH", v: null }), 5000);
      },
      clearFlash: () => dispatch({ t: "FLASH", v: null }),
    };
  }, []);

  // имперские фоновые процессы (указы, жизнь провинций, присутствие)
  useEffect(() => {
    if (!state.user) return;
    const timers: number[] = [];
    const t = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const st = () => stateRef.current;

    const pushIncoming = (chatId: string, authorId: string, type: MsgType, text: string) => {
      const msg: Message = { id: uid(), chatId, authorId, type, text, ts: Date.now(), status: "read" };
      dispatch({ t: "RECEIVE", msg });
      const s = st();
      const chat = s.chats.find((c) => c.id === chatId);
      const active = s.activeChatId === chatId && document.visibilityState === "visible";
      if (active) dispatch({ t: "MARK_READ", chatId, ts: Date.now() });
      if (!chat?.muted && !active) {
        api.toast("push", s.citizens[authorId]?.name ?? "Империя", text.slice(0, 90), chatId);
        api.chime("msg");
      }
    };

    const edictLoop = () => {
      t(() => {
        if (!st().user) return;
        pushIncoming("c-emperor", "emperor", "law", EDICTS[edictIdx.current++ % EDICTS.length]);
        edictLoop();
      }, 65000 + Math.random() * 35000);
    };
    const lawLoop = () => {
      t(() => {
        if (!st().user) return;
        pushIncoming("c-herald", "herald", "law", LAWS[lawIdx.current++ % LAWS.length]);
        lawLoop();
      }, 150000 + Math.random() * 60000);
    };
    const ambientLoop = () => {
      t(() => {
        if (!st().user) return;
        const zones: ["c-aurora" | "c-vega" | "g-circle", string[]][] = [
          ["c-aurora", ["yunna", "markus", "elara", "toren", "rik"]],
          ["c-vega", ["pip", "dorian", "kassia", "rik"]],
          ["g-circle", ["livia", "toren", "kassia", "dorian"]],
        ];
        const [chatId, pool] = zones[Math.floor(Math.random() * zones.length)];
        const key = chatId === "c-aurora" ? "aurora" : chatId === "c-vega" ? "vega" : "circle";
        const lines = AMBIENT[key];
        pushIncoming(chatId, pool[Math.floor(Math.random() * pool.length)], "text", lines[Math.floor(Math.random() * lines.length)]);
        ambientLoop();
      }, 42000 + Math.random() * 30000);
    };
    const presenceLoop = () => {
      t(() => {
        if (!st().user) return;
        const ids = ["kassia", "markus", "rik", "yunna", "pip", "dorian"];
        const id = ids[Math.floor(Math.random() * ids.length)];
        const cur = st().citizens[id];
        if (cur) dispatch({ t: "PRESENCE", id, online: !cur.online });
        presenceLoop();
      }, 15000 + Math.random() * 12000);
    };
    const elaraLoop = () => {
      t(() => {
        if (!st().user) return;
        if (Math.random() < 0.55 && st().chats.some((c) => c.id === "dm-elara")) {
          const lines = PERSONAL_REPLIES.elara;
          pushIncoming("dm-elara", "elara", "text", lines[Math.floor(Math.random() * lines.length)]);
        }
        elaraLoop();
      }, 95000 + Math.random() * 70000);
    };
    edictLoop(); lawLoop(); ambientLoop(); presenceLoop(); elaraLoop();
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.hit]);

  // оффлайн-режим
  useEffect(() => {
    const on = () => {
      dispatch({ t: "OFFLINE", v: false });
      if (stateRef.current.user) {
        api.toast("success", "Связь восстановлена", "Имперский канал снова в строю");
        pendingRef.current.forEach((p) => dispatch({ t: "MSG_STATUS", chatId: p.chatId, status: "delivered" }));
        pendingRef.current = [];
      }
    };
    const off = () => {
      dispatch({ t: "OFFLINE", v: true });
      api.toast("warn", "Связь потеряна", "Оффлайн-режим: послания будут сохранены локально");
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [api]);

  // истечение сессии
  useEffect(() => {
    const h = window.setInterval(() => {
      const u = stateRef.current.user;
      if (u && Date.now() > u.sessionExpires) api.logout("Срок действия сессии истёк. Пройдите проверку заново.");
    }, 30000);
    return () => clearInterval(h);
  }, [api]);

  return <Ctx.Provider value={{ state, api }}>{children}</Ctx.Provider>;
}

// ─── Селекторы ───────────────────────────────────────────────────────────
export const unreadOf = (s: State, chat: Chat) =>
  (s.messages[chat.id] ?? []).filter((m) => m.ts > chat.lastReadAt && m.authorId !== "me").length;

export const lastMsgOf = (s: State, chat: Chat): Message | null => {
  const list = s.messages[chat.id] ?? [];
  return list.length ? list[list.length - 1] : null;
};

export const chatName = (s: State, chat: Chat) =>
  chat.kind === "dm" ? s.citizens[chat.memberIds[0]]?.name ?? chat.title : chat.title;

export const chatColor = (s: State, chat: Chat): string => {
  if (chat.kind === "dm") return s.citizens[chat.memberIds[0]]?.color ?? "#6ea8ff";
  if (chat.kind === "province") return "#5ad1b9";
  if (chat.kind === "channel") return "#ffd700";
  return "#b78bff";
};

export const dmCitizen = (s: State, chat: Chat): Citizen | null =>
  chat.kind === "dm" ? s.citizens[chat.memberIds[0]] ?? null : null;

export const statusLine = (s: State, chat: Chat): string => {
  const typing = s.typing[chat.id];
  if (typing) {
    const n = s.citizens[typing]?.name.split(" ")[0] ?? "Кто-то";
    return chat.kind === "dm" ? "печатает…" : `${n} печатает…`;
  }
  if (chat.kind === "dm") {
    const c = dmCitizen(s, chat);
    if (!c) return "";
    return c.online ? "в сети" : fmtLastSeenShort(c.lastSeen);
  }
  if (chat.kind === "channel") {
    const n = chat.id === "c-emperor" ? 128404 : chat.id === "c-herald" ? 96210 : 54118;
    return `${n.toLocaleString("ru-RU")} ${plural(n, "подписчик", "подписчика", "подписчиков")}`;
  }
  const n = chat.memberIds.length + 1;
  return `${n} ${plural(n, "участник", "участника", "участников")}`;
};

const fmtLastSeenShort = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 300000) return "был(а) недавно";
  if (diff < 3600000) return `был(а) ${Math.floor(diff / 60000)} мин назад`;
  return `был(а) в ${fmtTime(ts)}`;
};
