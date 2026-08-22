import { useMemo, useState } from "react";
import { fmtClock, useStore } from "../store";
import type { Chat, Message } from "../types";
import { RANK_META } from "../data/seed";
import { IArchive, IBell, IBellOff, IChevD, IPin, IPlus, ISearch, IVerified, IX } from "../icons";

type Tab = "all" | "dm" | "group" | "channel" | "archive";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "dm", label: "Личные" },
  { id: "group", label: "Группы" },
  { id: "channel", label: "Каналы" },
  { id: "archive", label: "Архив" },
];

export function chatAvatarStyle(chat: Chat) {
  return {
    background: `linear-gradient(135deg, hsl(${chat.hue} 55% 22%), hsl(${(chat.hue + 40) % 360} 60% 12%))`,
    boxShadow: `inset 0 0 0 1px hsl(${chat.hue} 60% 40% / 0.35)`,
  };
}

export function lastOf(list: Message[] | undefined): Message | undefined {
  return list?.[list.length - 1];
}

export function previewOf(msg: Message | undefined, typingWho: string | null, isGroup: boolean, nameOf: (id: string) => string): string {
  if (typingWho) return `${isGroup ? nameOf(typingWho).split(" ")[0] + " " : ""}печатает…`;
  if (!msg) return "Нет сообщений";
  const who = msg.mine ? "Вы" : isGroup ? nameOf(msg.authorId).split(" ")[0] : "";
  const prefix = who ? who + ": " : "";
  if (msg.deleted) return prefix + "🚫 сообщение удалено";
  switch (msg.kind) {
    case "image": return prefix + "📷 " + (msg.text || "Фотография");
    case "file": return prefix + "📎 " + (msg.file?.name ?? "Файл");
    case "voice": return prefix + `🎙 Голосовое • ${msg.voice?.duration} c`;
    case "transfer": return prefix + `💰 Перевод ${msg.transfer?.amount} HYPER`;
    case "edict": return "👑 " + msg.text;
    case "law": return "📜 " + msg.text;
    case "market": return "🏛 " + msg.text;
    default: return prefix + msg.text;
  }
}

function timeLabel(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return fmtClock(ts);
  if (today.getTime() - ts < 6 * 86400000) return d.toLocaleDateString("ru-RU", { weekday: "short" });
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

export default function Sidebar() {
  const { state, a } = useStore();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const nameOf = (id: string) => state.citizens[id]?.name ?? "Гражданин";

  const rows = useMemo(() => {
    const chats = Object.values(state.chats);
    const filtered = chats.filter((c) => {
      if (tab === "archive") return c.archived;
      if (c.archived) return false;
      if (tab === "dm") return c.kind === "dm";
      if (tab === "group") return c.kind === "group";
      if (tab === "channel") return c.kind === "channel";
      return true;
    });
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      return filtered.filter((c) => c.title.toLowerCase().includes(s));
    }
    return filtered.sort((x, y) => {
      if (tab !== "archive") {
        if (!!x.pinned !== !!y.pinned) return x.pinned ? -1 : 1;
      }
      return (lastOf(state.messages[y.id])?.ts ?? 0) - (lastOf(state.messages[x.id])?.ts ?? 0);
    });
  }, [state.chats, state.messages, tab, q]);

  const totalUnread = useMemo(
    () => Object.entries(state.unread).reduce((acc, [id, n]) => acc + (state.chats[id]?.archived ? 0 : n), 0),
    [state.unread, state.chats]
  );

  const chatOpen = !!state.ui.activeChatId;
  return (
    <aside className={`w-full md:w-[340px] lg:w-[356px] shrink-0 flex-col h-full border-r border-line/50 glass relative z-10 ${chatOpen ? "hidden md:flex" : "flex"}`}>
      {/* шапка */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-xl">Империум <span className="text-gold">Линк</span></span>
          </div>
          <button
            onClick={() => a.ui({ modal: "newGroup" })}
            title="Создать группу или канал"
            className="btn-ghost w-9 h-9 rounded-xl grid place-items-center hover:rotate-90 transition-transform duration-300"
          >
            <IPlus size={17} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 input-imperial rounded-xl h-10 px-3">
          <ISearch size={16} className="text-mut shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по чатам…"
            className="bg-transparent outline-none w-full text-sm"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-mut hover:text-gold"><IX size={14} /></button>
          )}
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 h-8 rounded-lg text-[12.5px] font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-gold text-ink shadow-[0_2px_16px_rgba(255,215,0,0.35)]"
                  : "text-silver/75 hover:text-gold hover:bg-gold/[0.07]"
              }`}
            >
              {t.label}
              {t.id === "all" && totalUnread > 0 && (
                <span className={`ml-1.5 text-[10.5px] ${tab === t.id ? "text-ink/70" : "text-gold"}`}>{totalUnread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* список */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {rows.length === 0 && (
          <div className="text-center text-mut text-sm py-14 anim-fade">
            <div className="text-3xl mb-2">{tab === "archive" ? "🗄" : "🕊"}</div>
            {tab === "archive" ? "Архив пуст. Тишина, достойная Сената." : "Ничего не найдено."}
          </div>
        )}
        {rows.map((chat) => {
          const last = lastOf(state.messages[chat.id]);
          const typingWho = state.typing[chat.id] ?? null;
          const unread = state.unread[chat.id] ?? 0;
          const active = state.ui.activeChatId === chat.id;
          const dmUser = chat.kind === "dm" ? state.citizens[chat.memberIds[0]] : null;
          return (
            <div key={chat.id} className="relative group">
              <button
                onClick={() => a.openChat(chat.id)}
                className={`w-full text-left px-2.5 py-2.5 rounded-xl flex gap-3 transition-all duration-150 ${
                  active ? "bg-gold/[0.12] shadow-[inset_0_0_0_1px_rgba(255,215,0,0.25)]" : "hover:bg-white/[0.045]"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl grid place-items-center text-[22px]" style={chatAvatarStyle(chat)}>
                    {chat.emoji}
                  </div>
                  {dmUser && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-ink ${
                        dmUser.presence === "online" ? "bg-mint" : "bg-[#3a3a6a]"
                      }`}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[14px] truncate">{chat.title}</span>
                    {chat.verified && <IVerified size={15} className="text-gold shrink-0" />}
                    {chat.pinned && !chat.archived && <IPin size={13} className="text-gold/70 shrink-0" />}
                    {chat.muted && <IBellOff size={13} className="text-mut shrink-0" />}
                    <span className="ml-auto text-[11px] text-mut shrink-0">{last ? timeLabel(last.ts) : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {dmUser && (
                      <span className="text-[10px] font-bold tracking-wide shrink-0" style={{ color: RANK_META[dmUser.rank].color }}>
                        {dmUser.rank}
                      </span>
                    )}
                    <span className={`text-[12.5px] truncate ${typingWho ? "text-gold italic" : unread ? "text-body/90" : "text-mut"}`}>
                      {previewOf(last, typingWho, chat.kind !== "dm", nameOf)}
                    </span>
                    {unread > 0 && !chat.archived && (
                      <span
                        className={`ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full grid place-items-center text-[11px] font-bold ${
                          chat.muted ? "bg-[#2c2c5c] text-silver/80" : "bg-gold text-ink shadow-[0_2px_12px_rgba(255,215,0,0.4)]"
                        }`}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {/* меню */}
              <button
                onClick={() => setMenuFor(menuFor === chat.id ? null : chat.id)}
                className="absolute right-2 top-2.5 w-7 h-7 rounded-lg grid place-items-center text-mut hover:text-gold hover:bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IChevD size={15} />
              </button>
              {menuFor === chat.id && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuFor(null)} />
                  <div className="absolute right-2 top-10 z-40 w-52 glass-strong gold-frame rounded-xl p-1.5 anim-pop">
                    <MenuItem icon={<IPin size={15} />} label={chat.pinned ? "Открепить" : "Закрепить"} onClick={() => { a.toggleChat(chat.id, "pinned"); setMenuFor(null); }} />
                    <MenuItem icon={chat.muted ? <IBell size={15} /> : <IBellOff size={15} />} label={chat.muted ? "Включить звук" : "Без уведомлений"} onClick={() => { a.toggleChat(chat.id, "muted"); setMenuFor(null); }} />
                    <MenuItem icon={<IArchive size={15} />} label={chat.archived ? "Вернуть из архива" : "В архив"} onClick={() => { a.toggleChat(chat.id, "archived"); setMenuFor(null); }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* футер */}
      <div className="px-4 py-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-mut">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          Сеть Империи • WebSocket активен
        </span>
        <span className="text-gold/70">🔒 E2E</span>
      </div>
    </aside>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-silver hover:bg-gold/10 hover:text-gold transition-colors">
      {icon} {label}
    </button>
  );
}
