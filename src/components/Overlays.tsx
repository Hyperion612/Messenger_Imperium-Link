import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fmtClock, lightLevel, useStore } from "../store";
import type { Toast } from "../types";
import { AWARDS, MARKET_ITEMS, RANK_META, RANK_ORDER } from "../data/seed";
import { chatAvatarStyle, lastOf } from "./Sidebar";
import { IArrowR, ICheck, ICoins, IFlag, ILock, ILogout, ISearch, IStar, IUsers, IWallet, IX, ImperialSeal, Laurel } from "../icons";

const ME = "HIT-77777";

/* ================= хост ================= */
export default function OverlayHost() {
  const { state, a } = useStore();
  const m = state.ui.modal;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (m) a.ui({ modal: null, reportTarget: null, forwardMsg: null, modalChatId: null, citizenId: null });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [m, a]);

  return (
    <>
      <ToastStack />
      {m === "profile" && <ProfileDrawer />}
      {m === "citizen" && state.ui.citizenId && <CitizenDrawer />}
      {m === "search" && <SearchOverlay />}
      {m === "transfer" && <TransferModal />}
      {m === "market" && <MarketModal />}
      {m === "treasury" && <TreasuryModal />}
      {m === "report" && <ReportModal />}
      {m === "newGroup" && <NewGroupModal />}
    </>
  );
}

/* ================= тосты ================= */
function ToastStack() {
  const { state } = useStore();
  return (
    <div className="fixed top-4 right-4 z-[90] space-y-2.5 w-[min(360px,calc(100vw-2rem))]">
      {state.toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}

const TOAST_STYLE: Record<Toast["kind"], { border: string; icon: string; glow: string }> = {
  info: { border: "border-silver/30", icon: "🕊", glow: "rgba(192,192,192,0.12)" },
  success: { border: "border-mint/40", icon: "✅", glow: "rgba(74,222,156,0.14)" },
  warning: { border: "border-ember/50", icon: "⚠️", glow: "rgba(255,110,98,0.16)" },
  award: { border: "border-gold/60", icon: "🏅", glow: "rgba(255,215,0,0.2)" },
  mention: { border: "border-gold/50", icon: "✦", glow: "rgba(255,215,0,0.16)" },
  push: { border: "border-azure/40", icon: "🔔", glow: "rgba(110,168,255,0.16)" },
};

function ToastItem({ t }: { t: Toast }) {
  const { a } = useStore();
  useEffect(() => {
    const timer = window.setTimeout(() => a.dismissToast(t.id), 4600);
    return () => clearTimeout(timer);
  }, [t.id, a]);
  const s = TOAST_STYLE[t.kind];
  return (
    <button
      onClick={() => a.dismissToast(t.id)}
      className={`w-full text-left glass-strong ${s.border} rounded-2xl px-4 py-3 flex gap-3 anim-slide-left hover:brightness-110 transition-all`}
      style={{ boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 30px ${s.glow}` }}
    >
      <span className="text-xl leading-none mt-0.5">{s.icon}</span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold leading-snug">{t.title}</span>
        <span className="block text-[12px] text-mut leading-snug mt-0.5">{t.text}</span>
      </span>
    </button>
  );
}

/* ================= каркас модалки ================= */
function Modal({ children, onClose, w = "max-w-lg" }: { children: ReactNode; onClose: () => void; w?: string }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink2/70 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className={`relative w-full ${w} glass-strong gold-frame rounded-2xl anim-pop max-h-[88vh] flex flex-col`}>{children}</div>
    </div>
  );
}

function Drawer({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink2/60 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[min(380px,100vw)] glass-strong border-l border-gold/15 anim-slide-left overflow-y-auto">{children}</div>
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6.5 rounded-full p-1 transition-colors duration-200 ${on ? "bg-gold" : "bg-[#2c2c5c]"}`}
      style={{ height: 26 }}
    >
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-[18px]" : ""}`} style={{ background: on ? "#141400" : "#8f90b5" }} />
    </button>
  );
}

/* ================= профиль ================= */
function ProfileDrawer() {
  const { state, a } = useStore();
  const me = state.citizens[ME];
  const lvl = lightLevel(state.light);
  const hoursLeft = state.session ? Math.max(0, Math.ceil((state.session.expiresAt - Date.now()) / 3600000)) : 0;
  const close = () => a.ui({ modal: null });

  return (
    <Drawer onClose={close}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-[0.3em] text-gold/80">Досье гражданина</span>
          <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold hover:bg-gold/10"><IX size={16} /></button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl grid place-items-center text-4xl" style={{ background: `linear-gradient(135deg, hsl(${me.hue} 60% 24%), hsl(${me.hue + 40} 60% 12%))`, boxShadow: `0 0 0 2px ${RANK_META[me.rank].color}66, 0 0 30px ${RANK_META[me.rank].color}33` }}>
              {me.emoji}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-mint border-[3px] border-ink" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-2xl leading-tight">{me.name}</div>
            <div className="text-[12px] text-mut">{me.title}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md border" style={{ color: RANK_META[me.rank].color, borderColor: RANK_META[me.rank].color + "66" }}>{me.rank}</span>
              <span className="font-mono text-[11px] text-silver/70">{me.id}</span>
            </div>
          </div>
        </div>

        {/* баланс */}
        <div className="mt-6 rounded-2xl gold-frame glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/12 border border-gold/30 grid place-items-center text-gold"><IWallet size={24} /></div>
          <div>
            <div className="font-display font-black text-3xl text-gold leading-none">{state.balance.toLocaleString("ru-RU")}</div>
            <div className="text-[11px] text-mut mt-1">HYPER • единый счёт Казначейства</div>
          </div>
          <button onClick={() => a.ui({ modal: "treasury" })} className="ml-auto btn-ghost h-9 px-3.5 rounded-xl text-[12px] font-semibold flex items-center gap-1.5">
            Казначейство <IArrowR size={13} />
          </button>
        </div>

        {/* Уровень Света */}
        <div className="mt-4 rounded-2xl glass p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold flex items-center gap-1.5 text-goldsoft"><IStar size={14} className="text-gold" /> Уровень Света: {lvl.name}</span>
            <span className="text-[11px] text-mut">{state.light} св.</span>
          </div>
          <div className="mt-2.5 h-2 rounded-full bg-[#1c1c44] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#c9a800] to-[#ffe25c] transition-all duration-700" style={{ width: `${lvl.pct}%` }} />
          </div>
          <div className="text-[11px] text-mut mt-1.5">
            {lvl.next ? <>До уровня «{lvl.next}» — {lvl.pct}% пути. Пишите послания, копите свет.</> : "Высшая ступень достигнута."}
          </div>
        </div>

        {/* награды */}
        <div className="mt-6">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut">Награды за активность</div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {AWARDS.map((aw) => {
              const earned = state.awards.includes(aw.id);
              return (
                <div key={aw.id} className={`rounded-xl border p-3 transition-all ${earned ? "border-gold/40 bg-gold/[0.07]" : "border-line/60 opacity-60"}`}>
                  <div className={`text-2xl ${earned ? "" : "grayscale opacity-70"}`}>{aw.emoji}</div>
                  <div className={`text-[12px] font-bold mt-1 ${earned ? "text-goldsoft" : "text-silver/80"}`}>{aw.name}</div>
                  <div className="text-[10.5px] text-mut leading-snug mt-0.5">{earned ? aw.desc : `${Math.min(state.sentCount, aw.need)}/${aw.need} посланий`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* лестница рангов */}
        <div className="mt-6">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut">Ранги и привилегии</div>
          <div className="mt-2.5 space-y-1.5">
            {RANK_ORDER.filter((r) => r !== "ИМПЕРАТОР").map((r) => {
              const mine = RANK_ORDER.indexOf(me.rank) >= RANK_ORDER.indexOf(r);
              return (
                <div key={r} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 border ${mine ? "border-transparent bg-white/[0.03]" : "border-transparent opacity-45"}`}>
                  {mine ? <ICheck size={13} style={{ color: RANK_META[r].color }} /> : <ILock size={12} className="text-mut" />}
                  <span className="text-[11.5px] font-bold" style={{ color: RANK_META[r].color }}>{r}</span>
                  <span className="text-[10.5px] text-mut truncate ml-auto text-right">{RANK_META[r].desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* настройки */}
        <div className="mt-6">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut">Настройки уведомлений</div>
          <div className="mt-2.5 rounded-xl glass divide-y divide-line/50">
            <div className="flex items-center justify-between px-4 py-3">
              <div><div className="text-[13px] font-semibold">Звуковые уведомления</div><div className="text-[11px] text-mut">Колокола Империи при новых посланиях</div></div>
              <Switch on={state.settings.sound} onChange={(v) => a.setSettings({ sound: v })} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div><div className="text-[13px] font-semibold">Push-уведомления</div><div className="text-[11px] text-mut">Оповещения, когда приложение закрыто</div></div>
              <Switch on={state.settings.push} onChange={(v) => a.setSettings({ push: v })} />
            </div>
          </div>
        </div>

        {/* сессии */}
        <div className="mt-6">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut">Активные сессии</div>
          <div className="mt-2.5 rounded-xl glass divide-y divide-line/50">
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">🖥</span>
              <div className="min-w-0"><div className="text-[12.5px] font-semibold">Браузер • Imperium Web</div><div className="text-[10.5px] text-mint">текущая сессия</div></div>
              <span className="ml-auto text-[10.5px] text-mut">истекает через {hoursLeft} ч</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">📱</span>
              <div className="min-w-0"><div className="text-[12.5px] font-semibold">Гиперион Mobile • React Native</div><div className="text-[10.5px] text-mut">Аврора, 2 ч назад</div></div>
              <button onClick={() => a.toast("success", "Сессия завершена", "Гиперион Mobile отключён от связи.")} className="ml-auto text-[11px] text-ember hover:underline">завершить</button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Laurel className="w-16 text-gold/50 mx-auto" />
        </div>
        <button onClick={a.logout} className="mt-4 w-full h-11 rounded-xl border border-ember/40 text-ember hover:bg-ember/10 transition-colors font-semibold text-sm flex items-center justify-center gap-2">
          <ILogout size={16} /> Покинуть цитадель
        </button>
        <div className="mt-4 text-center text-[10.5px] text-mut">Империум Линк v3.7 • единая система аккаунтов Гиперион-ID</div>
      </div>
    </Drawer>
  );
}

/* ================= досье гражданина ================= */
function CitizenDrawer() {
  const { state, a } = useStore();
  const c = state.citizens[state.ui.citizenId!];
  const close = () => a.ui({ modal: null, citizenId: null });
  if (!c) return null;
  const dmChat = Object.values(state.chats).find((ch) => ch.kind === "dm" && ch.memberIds.includes(c.id));
  const lvl = lightLevel(c.light);

  const write = () => {
    if (dmChat) {
      a.openChat(dmChat.id);
      a.ui({ modal: null, citizenId: null });
    } else {
      a.toast("info", "Гиперион-ID", `Личная переписка с ${c.name} будет создана Стражей в течение дня.`);
    }
  };

  return (
    <Drawer onClose={close}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-[0.3em] text-gold/80">Досье • Гиперион-ID</span>
          <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold hover:bg-gold/10"><IX size={16} /></button>
        </div>
        <div className="mt-6 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl grid place-items-center text-5xl mx-auto" style={{ background: `linear-gradient(135deg, hsl(${c.hue} 60% 24%), hsl(${c.hue + 40} 60% 12%))`, boxShadow: `0 0 0 2px ${RANK_META[c.rank].color}66, 0 0 34px ${RANK_META[c.rank].color}30` }}>
              {c.emoji}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-ink ${c.presence === "online" ? "bg-mint" : "bg-[#3a3a6a]"}`} />
          </div>
          <div className="font-display font-extrabold text-2xl mt-4">{c.name}</div>
          <div className="text-[12.5px] text-mut mt-0.5">{c.title}</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md border" style={{ color: RANK_META[c.rank].color, borderColor: RANK_META[c.rank].color + "66" }}>{c.rank}</span>
            <span className="font-mono text-[11px] text-silver/70">{c.id}</span>
          </div>
          <div className="text-[12px] text-mut mt-2">
            {c.presence === "online" ? "🟢 в сети" : c.presence === "recent" ? "🌙 был(а) недавно" : `⚫ был(а) в ${fmtClock(c.lastSeen)}`}
          </div>
        </div>

        <div className="mt-6 rounded-2xl glass p-4">
          <div className="flex items-center justify-between text-[12px] font-bold text-goldsoft"><span className="flex items-center gap-1.5"><IStar size={13} className="text-gold" /> Уровень Света</span><span>{c.light} св.</span></div>
          <div className="mt-2 h-2 rounded-full bg-[#1c1c44] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#c9a800] to-[#ffe25c]" style={{ width: `${lvl.pct}%` }} />
          </div>
          <div className="text-[11px] text-mut mt-1.5">Ступень «{lvl.name}»{lvl.next ? ` → следующая «${lvl.next}»` : ""}</div>
        </div>

        <div className="mt-4 space-y-2.5">
          <button onClick={write} className="btn-gold w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2">💬 Написать послание</button>
          <button
            onClick={() => {
              if (!dmChat) { a.toast("info", "Казначейство", "Сначала создайте переписку с гражданином."); return; }
              a.ui({ modal: "transfer", modalChatId: dmChat.id });
            }}
            className="btn-ghost w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ICoins size={17} /> Перевести HYPER
          </button>
        </div>
        <div className="mt-5 text-center text-[10.5px] text-mut">Репутация проверена Казначейством • жалоб: 0</div>
      </div>
    </Drawer>
  );
}

/* ================= поиск ================= */
function hl(text: string, q: string): ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}<mark>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}
    </>
  );
}

function SearchOverlay() {
  const { state, a } = useStore();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "msg" | "chat" | "cit">("all");
  const [typeF, setTypeF] = useState("any");
  const [dateF, setDateF] = useState("any");
  const close = () => a.ui({ modal: null });

  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    const now = Date.now();
    const dayStart = new Date(new Date().toDateString()).getTime();
    const inDate = (ts: number) => (dateF === "today" ? ts >= dayStart : dateF === "week" ? ts >= now - 7 * 86400000 : true);
    const inType = (kind: string) =>
      typeF === "any" || (typeF === "text" && kind === "text") || (typeF === "photo" && kind === "image") || (typeF === "file" && kind === "file") || (typeF === "voice" && kind === "voice") || (typeF === "transfer" && kind === "transfer");

    const msgs: { chatId: string; id: string; text: string; ts: number; kind: string; chatTitle: string; emoji: string }[] = [];
    const chats: { id: string; title: string; emoji: string; kind: string; hue: number }[] = [];
    const cits: { id: string; name: string; rank: string; emoji: string; hue: number }[] = [];
    if (!s) return { msgs, chats, cits };

    for (const chat of Object.values(state.chats)) {
      if ((tab === "all" || tab === "chat") && (chat.title.toLowerCase().includes(s) || chat.description.toLowerCase().includes(s))) {
        chats.push({ id: chat.id, title: chat.title, emoji: chat.emoji, kind: chat.kind, hue: chat.hue });
      }
      if (tab === "all" || tab === "msg") {
        for (const m of state.messages[chat.id] ?? []) {
          if (m.deleted) continue;
          const hay = (m.text + " " + (m.file?.name ?? "")).toLowerCase();
          if (hay.includes(s) && inDate(m.ts) && inType(m.kind)) {
            msgs.push({ chatId: chat.id, id: m.id, text: m.text || m.file?.name || "вложение", ts: m.ts, kind: m.kind, chatTitle: chat.title, emoji: chat.emoji });
          }
        }
      }
    }
    if (tab === "all" || tab === "cit") {
      for (const c of Object.values(state.citizens)) {
        if (c.id === ME) continue;
        if (c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s)) cits.push({ id: c.id, name: c.name, rank: c.rank, emoji: c.emoji, hue: c.hue });
      }
    }
    msgs.sort((x, y) => y.ts - x.ts);
    return { msgs: msgs.slice(0, 25), chats: chats.slice(0, 10), cits: cits.slice(0, 10) };
  }, [q, tab, typeF, dateF, state.chats, state.messages, state.citizens]);

  const openMsg = (chatId: string) => {
    a.openChat(chatId);
    close();
  };

  const kindLabel: Record<string, string> = { text: "текст", image: "📷", file: "📎", voice: "🎙", transfer: "💰", law: "📜", edict: "👑", market: "🏛" };

  return (
    <Modal onClose={close} w="max-w-2xl">
      <div className="p-5 border-b border-line/50">
        <div className="flex items-center gap-3">
          <ISearch size={20} className="text-gold" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по Империи: послания, чаты, граждане…"
            className="flex-1 bg-transparent outline-none text-[16px]"
          />
          <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {([["all", "Всё"], ["msg", "Сообщения"], ["chat", "Чаты"], ["cit", "Граждане"]] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-3 h-8 rounded-lg text-[12px] font-semibold transition-colors ${tab === id ? "bg-gold text-ink" : "text-silver/75 hover:text-gold hover:bg-gold/[0.07]"}`}>{l}</button>
          ))}
          <span className="mx-1 h-5 w-px bg-line/70" />
          <select value={typeF} onChange={(e) => setTypeF(e.target.value)} className="input-imperial rounded-lg h-8 px-2 text-[12px] bg-panel outline-none">
            <option value="any">Любой тип</option><option value="text">Текст</option><option value="photo">Фото</option><option value="file">Файлы</option><option value="voice">Голосовые</option><option value="transfer">Переводы</option>
          </select>
          <select value={dateF} onChange={(e) => setDateF(e.target.value)} className="input-imperial rounded-lg h-8 px-2 text-[12px] bg-panel outline-none">
            <option value="any">За всё время</option><option value="today">Сегодня</option><option value="week">За неделю</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!q.trim() && (
          <div className="text-center py-14 text-mut anim-fade">
            <ImperialSeal size={56} className="mx-auto opacity-40" />
            <div className="mt-4 text-sm">Введите запрос — ИИ-ОКО найдёт всё: от указов до посланий Лирии.</div>
          </div>
        )}
        {q.trim() && res.msgs.length + res.chats.length + res.cits.length === 0 && (
          <div className="text-center py-14 text-mut anim-fade">Ничего не найдено. Империя хранит молчание по этому вопросу.</div>
        )}
        {res.chats.length > 0 && (
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.25em] text-mut mb-2">Чаты</div>
            {res.chats.map((c) => (
              <button key={c.id} onClick={() => { a.openChat(c.id); close(); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gold/[0.08] transition-colors text-left">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={chatAvatarStyle({ ...state.chats[c.id] })}>{c.emoji}</span>
                <span className="min-w-0"><span className="block text-[13.5px] font-semibold truncate">{hl(c.title, q)}</span><span className="text-[11px] text-mut">{c.kind === "dm" ? "личная переписка" : c.kind === "group" ? "группа" : c.kind === "channel" ? "канал" : "комната провинции"}</span></span>
              </button>
            ))}
          </div>
        )}
        {res.cits.length > 0 && (
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.25em] text-mut mb-2">Граждане</div>
            {res.cits.map((c) => (
              <button key={c.id} onClick={() => a.ui({ modal: "citizen", citizenId: c.id })} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gold/[0.08] transition-colors text-left">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={{ background: `linear-gradient(135deg, hsl(${c.hue} 55% 22%), hsl(${c.hue + 40} 60% 12%))` }}>{c.emoji}</span>
                <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-semibold truncate">{hl(c.name, q)}</span><span className="font-mono text-[10.5px] text-mut">{c.id}</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border" style={{ color: RANK_META[c.rank as keyof typeof RANK_META].color, borderColor: RANK_META[c.rank as keyof typeof RANK_META].color + "55" }}>{c.rank}</span>
              </button>
            ))}
          </div>
        )}
        {res.msgs.length > 0 && (
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.25em] text-mut mb-2">Сообщения</div>
            {res.msgs.map((mm) => (
              <button key={mm.id} onClick={() => openMsg(mm.chatId)} className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-gold/[0.08] transition-colors">
                <div className="flex items-center gap-2 text-[11px] text-mut">
                  <span>{mm.emoji}</span><span className="font-semibold text-silver/80">{mm.chatTitle}</span>
                  <span>{kindLabel[mm.kind] ?? ""}</span>
                  <span className="ml-auto">{fmtClock(mm.ts)}</span>
                </div>
                <div className="text-[13px] mt-0.5 line-clamp-2">{hl(mm.text, q)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ================= перевод / пересылка ================= */
function TransferModal() {
  const { state, a } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const close = () => a.ui({ modal: null, modalChatId: null, forwardMsg: null });

  /* режим пересылки */
  if (state.ui.forwardMsg) {
    const chats = Object.values(state.chats).filter((c) => !c.archived && !c.readonly).sort((x, y) => (lastOf(state.messages[y.id])?.ts ?? 0) - (lastOf(state.messages[x.id])?.ts ?? 0));
    return (
      <Modal onClose={close} w="max-w-md">
        <div className="p-5 border-b border-line/50 flex items-center gap-3">
          <span className="text-xl">↪️</span>
          <div className="flex-1"><div className="font-display font-bold text-lg leading-tight">Переслать послание</div><div className="text-[11.5px] text-mut truncate">«{state.ui.forwardMsg.text || "вложение"}»</div></div>
          <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 max-h-[50vh]">
          {chats.map((c) => (
            <button key={c.id} onClick={() => a.forwardTo(c.id)} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gold/[0.08] transition-colors text-left">
              <span className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0" style={chatAvatarStyle(c)}>{c.emoji}</span>
              <span className="text-[13.5px] font-semibold truncate">{c.title}</span>
              <IArrowR size={14} className="ml-auto text-mut" />
            </button>
          ))}
        </div>
      </Modal>
    );
  }

  const chat = state.ui.modalChatId ? state.chats[state.ui.modalChatId] : null;
  const target = chat?.kind === "dm" ? state.citizens[chat.memberIds[0]] : null;

  return (
    <Modal onClose={close} w="max-w-md">
      <div className="p-5 border-b border-line/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/30 grid place-items-center text-gold"><ICoins size={20} /></div>
        <div className="flex-1">
          <div className="font-display font-bold text-lg leading-tight">Перевод HYPER</div>
          <div className="text-[11.5px] text-mut">через Казначейство Империи • пошлина 0%</div>
        </div>
        <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
          <span className="text-2xl">{target?.emoji ?? chat?.emoji ?? "🏛"}</span>
          <div><div className="text-[13.5px] font-bold">{target?.name ?? chat?.title}</div><div className="text-[11px] text-mut">{target?.id ?? "получатель"}</div></div>
          <span className="ml-auto text-[11px] text-mut">Баланс: <b className="text-gold">{state.balance}</b></span>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80">Сума, HYPER</label>
          <div className="mt-1.5 flex items-center gap-2 input-imperial rounded-xl px-4 h-14">
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="bg-transparent outline-none w-full text-2xl font-display font-bold text-gold" />
            <span className="text-[12px] text-mut">HYPER</span>
          </div>
          <div className="mt-2 flex gap-2">
            {[50, 100, 250].map((v) => (
              <button key={v} onClick={() => setAmount(String(v))} className="px-3 h-8 rounded-lg text-[12px] font-bold border border-gold/25 text-goldsoft hover:bg-gold/10 transition-colors">{v}</button>
            ))}
            <button onClick={() => setAmount(String(state.balance))} className="px-3 h-8 rounded-lg text-[12px] font-bold border border-line text-mut hover:text-gold transition-colors">всё</button>
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80">Послание к переводу</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="За свет Империи!" maxLength={80} className="mt-1.5 w-full h-11 input-imperial rounded-xl px-4 text-[14px]" />
        </div>
        <button
          onClick={() => { if (chat) a.transferTo(chat.id, Number(amount), note); }}
          disabled={!amount || Number(amount) <= 0}
          className="btn-gold w-full h-12 rounded-xl font-bold text-[15px]"
        >
          Перевести {amount && Number(amount) > 0 ? `${Number(amount).toLocaleString("ru-RU")} HYPER` : ""}
        </button>
        <div className="text-[10.5px] text-mut text-center">Переводы защищены законом HYR-126 и печатью Казначейства</div>
      </div>
    </Modal>
  );
}

/* ================= казначейство ================= */
function TreasuryModal() {
  const { state, a } = useStore();
  const close = () => a.ui({ modal: null });
  const transfers = useMemo(() => {
    const out: { ts: number; amount: number; mine: boolean; title: string; note?: string }[] = [];
    for (const chat of Object.values(state.chats)) {
      for (const m of state.messages[chat.id] ?? []) {
        if (m.kind === "transfer" && m.transfer) out.push({ ts: m.ts, amount: m.transfer.amount, mine: !!m.mine, title: chat.title, note: m.transfer.note });
      }
    }
    return out.sort((x, y) => y.ts - x.ts).slice(0, 8);
  }, [state.chats, state.messages]);

  return (
    <Modal onClose={close} w="max-w-md">
      <div className="p-5 border-b border-line/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/30 grid place-items-center text-gold"><IWallet size={20} /></div>
        <div className="flex-1"><div className="font-display font-bold text-lg">Казначейство Империи</div><div className="text-[11.5px] text-mut">единый счёт Гиперион-ID</div></div>
        <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
      </div>
      <div className="p-5">
        <div className="rounded-2xl gold-frame glass p-5 text-center">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut">Баланс</div>
          <div className="font-display font-black text-5xl text-gold mt-2">{state.balance.toLocaleString("ru-RU")}</div>
          <div className="text-[12px] text-mut mt-1">HYPER • имперская валюта</div>
          <button onClick={() => a.topUp(100)} className="btn-gold h-10 px-5 rounded-xl text-[13px] font-bold mt-4">Получить грант Сената +100</button>
        </div>
        <div className="mt-5">
          <div className="text-[10.5px] uppercase tracking-[0.3em] text-mut mb-2">Последние операции</div>
          {transfers.length === 0 && <div className="text-[13px] text-mut py-4 text-center">Операций пока нет — Казначейство ждёт.</div>}
          <div className="space-y-1.5">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl px-3.5 py-2.5">
                <span className="text-lg">{t.mine ? "📤" : "📥"}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold truncate">{t.mine ? `Перевод в «${t.title}»` : `Входящий из «${t.title}»`}</div>
                  <div className="text-[10.5px] text-mut">{fmtClock(t.ts)}{t.note ? ` • «${t.note}»` : ""}</div>
                </div>
                <span className={`font-display font-bold text-[15px] ${t.mine ? "text-ember" : "text-mint"}`}>{t.mine ? "−" : "+"}{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================= рынок ================= */
function MarketModal() {
  const { state, a } = useStore();
  const close = () => a.ui({ modal: null });
  return (
    <Modal onClose={close} w="max-w-xl">
      <div className="p-5 border-b border-line/50 flex items-center gap-3">
        <span className="text-2xl">🏛</span>
        <div className="flex-1"><div className="font-display font-bold text-lg">Рынок Гипериона</div><div className="text-[11.5px] text-mut">Баланс: <b className="text-gold">{state.balance} HYPER</b> • покупки мгновенны</div></div>
        <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-3 overflow-y-auto">
        {MARKET_ITEMS.map((it) => {
          const afford = state.balance >= it.price;
          return (
            <div key={it.id} className={`rounded-2xl border p-4 flex flex-col transition-all ${afford ? "border-gold/25 bg-gold/[0.04] hover:border-gold/50 hover:-translate-y-0.5" : "border-line/60 opacity-70"}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{it.emoji}</span>
                <div className="min-w-0"><div className="text-[14px] font-bold">{it.name}</div><div className="text-[11.5px] text-mut leading-snug mt-0.5">{it.desc}</div></div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display font-bold text-gold">{it.price} HYPER</span>
                <button onClick={() => a.buyItem(it.id)} disabled={!afford} className="btn-gold h-9 px-4 rounded-lg text-[12.5px] font-bold">Купить</button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ================= жалоба ================= */
function ReportModal() {
  const { a } = useStore();
  const [reason, setReason] = useState("Спам");
  const [detail, setDetail] = useState("");
  const reasons = ["Спам", "Оскорбление гражданина", "Нарушение закона Империи", "Пропаганда мятежа", "Мошенничество с HYPER"];
  return (
    <Modal onClose={() => a.ui({ modal: null, reportTarget: null })} w="max-w-md">
      <div className="p-5 border-b border-line/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ember/12 border border-ember/30 grid place-items-center text-ember"><IFlag size={19} /></div>
        <div className="flex-1"><div className="font-display font-bold text-lg">Жалоба Страже</div><div className="text-[11.5px] text-mut">модерация рассмотрит в течение часа</div></div>
      </div>
      <div className="p-5 space-y-2.5">
        {reasons.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13.5px] transition-colors ${reason === r ? "border-gold/50 bg-gold/[0.08] text-goldsoft" : "border-line/60 text-silver/80 hover:border-silver/40"}`}>
            {reason === r ? "◉ " : "○ "}{r}
          </button>
        ))}
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Подробности (необязательно)…" rows={2} className="w-full input-imperial rounded-xl px-4 py-2.5 text-[13.5px] resize-none" />
        <div className="flex gap-2.5 pt-1">
          <button onClick={() => a.ui({ modal: null, reportTarget: null })} className="btn-ghost h-11 px-4 rounded-xl text-sm">Отмена</button>
          <button onClick={() => a.report("", reason + (detail ? `: ${detail}` : ""))} className="btn-gold flex-1 h-11 rounded-xl font-bold text-sm">Отправить жалобу</button>
        </div>
      </div>
    </Modal>
  );
}

/* ================= новая группа ================= */
function NewGroupModal() {
  const { state, a } = useStore();
  const [mode, setMode] = useState<"group" | "channel">("group");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⚔️");
  const [sel, setSel] = useState<string[]>(["HIT-24816"]);
  const close = () => a.ui({ modal: null });
  const people = Object.values(state.citizens).filter((c) => c.id !== ME && c.rank !== "ИМПЕРАТОР");

  return (
    <Modal onClose={close} w="max-w-md">
      <div className="p-5 border-b border-line/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/30 grid place-items-center text-gold"><IUsers size={19} /></div>
        <div className="flex-1">
          <div className="font-display font-bold text-lg">Новое собрание</div>
          <div className="text-[11.5px] text-mut">{mode === "group" ? "группа • с ранга ГРАЖДАНИН • до 1000 участников" : "канал • с ранга ОФИЦЕР • подписчики без ограничений"}</div>
        </div>
        <button onClick={close} className="w-8 h-8 rounded-lg grid place-items-center text-mut hover:text-gold"><IX size={16} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-line/60">
          <button onClick={() => setMode("group")} className={`h-9 rounded-lg text-[13px] font-bold transition-all ${mode === "group" ? "bg-gold text-ink shadow" : "text-silver/70 hover:text-gold"}`}>⚔️ Группа</button>
          <button onClick={() => setMode("channel")} className={`h-9 rounded-lg text-[13px] font-bold transition-all ${mode === "channel" ? "bg-gold text-ink shadow" : "text-silver/70 hover:text-gold"}`}>📣 Канал</button>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80">Название</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Дозор Восточных Врат" maxLength={40} className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[15px] font-semibold" />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80">Знамя</label>
          <div className="mt-1.5 flex gap-2">
            {["⚔️", "🛡", "🦅", "🏰", "🗡", "🚩", "⚜️", "🔥"].map((e) => (
              <button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl grid place-items-center text-lg border transition-all ${emoji === e ? "border-gold bg-gold/15 scale-110" : "border-line/60 hover:border-silver/40"}`}>{e}</button>
            ))}
          </div>
        </div>
        {mode === "channel" && (
          <div className="rounded-xl border border-azure/25 bg-azure/[0.06] px-4 py-3 text-[12px] leading-relaxed text-silver/85">
            📣 В канале вещает только основатель. Подписчики читают и внимают — число подписчиков не ограничено.
          </div>
        )}
        {mode === "group" && <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80">Участники • {sel.length + 1}</label>
          <div className="mt-1.5 max-h-44 overflow-y-auto space-y-1 pr-1">
            {people.map((c) => {
              const on = sel.includes(c.id);
              return (
                <button key={c.id} onClick={() => setSel((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl border text-left transition-colors ${on ? "border-gold/40 bg-gold/[0.07]" : "border-transparent hover:bg-white/[0.04]"}`}>
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-[13px] font-semibold truncate flex-1">{c.name}</span>
                  <span className="text-[9.5px] font-bold" style={{ color: RANK_META[c.rank].color }}>{c.rank}</span>
                  {on && <ICheck size={15} className="text-gold" />}
                </button>
              );
            })}
          </div>
        </div>}
        <button
          onClick={() => (mode === "group" ? a.createGroup(title, emoji, sel) : a.createChannel(title, emoji))}
          disabled={!title.trim()}
          className="btn-gold w-full h-12 rounded-xl font-bold text-[15px]"
        >
          {mode === "group" ? "Создать группу" : "Основать канал"}
        </button>
      </div>
    </Modal>
  );
}
