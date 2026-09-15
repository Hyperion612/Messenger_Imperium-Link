import { useEffect, useMemo, useRef, useState } from "react";
import { fmtClock, fmtDay, presenceLabel, useStore } from "../store";
import type { Chat, Message } from "../types";
import { EMOJI_CATS, FAKE_DOCS, IMAGES, RANK_META } from "../data/seed";
import { chatAvatarStyle } from "./Sidebar";
import {
  IBell, IBellOff, ICheck, IChecks, IChevL, IClock, IClip, ICoins, ICopy, IDoc, IDownload,
  IFlag, IForward, ILandmark, ILock, IMega, IMic, IPause, IPen, IPhoto, IPlay, IPlus, IReply, ISend, ISmile,
  IStop, ITrash, IVerified, ImperialSeal,
} from "../icons";

const ME = "HIT-77777";
const RANK_LVL: Record<string, number> = { НОВИЧОК: 1, ГРАЖДАНИН: 2, СТРАЖ: 3, ОФИЦЕР: 4, ГЕНЕРАЛ: 5, СЕНАТОР: 6, ИМПЕРАТОР: 7 };

export default function ChatView() {
  const { state } = useStore();
  const chat = state.ui.activeChatId ? state.chats[state.ui.activeChatId] : null;
  if (!chat) return <EmptyState />;
  return <ChatInner key={chat.id} chat={chat} />;
}

/* ============ пустое состояние ============ */
function EmptyState() {
  const { state, a } = useStore();
  const online = Object.values(state.citizens).filter((c) => c.presence === "online").length;
  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-grid relative">
      <div className="relative">
        <div className="absolute inset-0 -m-8 rounded-full border border-dashed border-gold/25 spin-slow" />
        <ImperialSeal size={110} className="glow-breathe relative" />
      </div>
      <h2 className="font-display font-extrabold text-3xl mt-8">
        Добро пожаловать в <span className="text-gold">Империум Линк</span>
      </h2>
      <p className="text-mut text-sm mt-2 max-w-md text-center leading-relaxed">
        Государственный мессенджер Империи Гиперион. Создайте новый чат или присоединитесь к существующему.
      </p>
      <div className="mt-8 flex gap-3">
        <div className="glass rounded-xl px-5 py-3 text-center">
          <div className="font-display font-bold text-2xl text-gold">{online}</div>
          <div className="text-[11px] text-mut mt-0.5">граждан в сети</div>
        </div>
        <div className="glass rounded-xl px-5 py-3 text-center">
          <div className="font-display font-bold text-2xl text-silver">{state.balance}</div>
          <div className="text-[11px] text-mut mt-0.5">HYPER в казне</div>
        </div>
        <div className="glass rounded-xl px-5 py-3 text-center">
          <div className="font-display font-bold text-2xl text-azure">{Object.keys(state.chats).length}</div>
          <div className="text-[11px] text-mut mt-0.5">активных чатов</div>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => a.ui({ modal: "newChat" })}
          className="btn-gold h-11 px-6 rounded-xl font-bold text-[14px] flex items-center gap-2"
        >
          <IPlus size={18} /> Создать чат
        </button>
        <button
          onClick={() => a.ui({ modal: "dev" })}
          className="btn-ghost h-11 px-6 rounded-xl font-semibold text-[14px] flex items-center gap-2"
        >
          <ILandmark size={18} /> Для разработчиков
        </button>
      </div>
      <div className="mt-10 text-[11px] text-mut flex items-center gap-2">
        <ILock size={13} className="text-gold/70" /> Сквозное шифрование активно • Сеть Империи стабильна
      </div>
    </div>
  );
}

/* ============ основной чат ============ */
function ChatInner({ chat }: { chat: Chat }) {
  const { state, a } = useStore();
  const msgs = state.messages[chat.id] ?? [];
  const typingWho = state.typing[chat.id] ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const me = state.citizens[ME];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs.length, typingWho]);

  const jumpTo = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1600);
  };

  /* заголовок: статус */
  const dmUser = chat.kind === "dm" ? state.citizens[chat.memberIds[0]] : null;
  const subtitle = typingWho
    ? `${chat.kind !== "dm" ? state.citizens[typingWho]?.name.split(" ")[0] + " " : ""}печатает…`
    : chat.kind === "dm" && dmUser
    ? presenceLabel(dmUser)
    : chat.kind === "channel"
    ? `${(chat.subscribers ?? 0).toLocaleString("ru-RU")} подписчиков • только чтение`
    : `${chat.memberIds.length + 1} участников • ${chat.memberIds.filter((id) => state.citizens[id]?.presence === "online").length + 1} в сети`;

  const grouped = useMemo(() => {
    const out: { day: string; items: Message[] }[] = [];
    for (const m of msgs) {
      const day = fmtDay(m.ts);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return out;
  }, [msgs]);

  return (
    <section className="flex-1 flex flex-col h-full min-w-0 relative">
      {/* шапка */}
      <header className="glass border-b border-line/50 px-3 sm:px-5 h-[64px] flex items-center gap-3 shrink-0 relative z-20">
        <button onClick={a.closeChat} className="md:hidden btn-ghost w-9 h-9 rounded-xl grid place-items-center">
          <IChevL size={18} />
        </button>
        <button
          className="flex items-center gap-3 min-w-0 text-left"
          onClick={() => {
            if (chat.kind === "dm" && dmUser) a.ui({ modal: "citizen", citizenId: dmUser.id });
            else a.toast("info", `${chat.emoji} ${chat.title}`, chat.description);
          }}
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl grid place-items-center text-xl" style={chatAvatarStyle(chat)}>{chat.emoji}</div>
            {dmUser && (
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink ${dmUser.presence === "online" ? "bg-mint" : "bg-[#3a3a6a]"}`} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-[16px] truncate">{chat.title}</span>
              {chat.verified && <IVerified size={15} className="text-gold shrink-0" />}
              {dmUser && (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border shrink-0" style={{ color: RANK_META[dmUser.rank].color, borderColor: RANK_META[dmUser.rank].color + "55" }}>
                  {dmUser.rank}
                </span>
              )}
            </div>
            <div className={`text-[12px] truncate ${typingWho ? "text-gold italic" : "text-mut"}`}>{subtitle}</div>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          {chat.kind === "dm" && (
            <button
              title="Перевести HYPER"
              onClick={() => a.ui({ modal: "transfer", modalChatId: chat.id, forwardMsg: null })}
              className="btn-ghost w-9 h-9 rounded-xl grid place-items-center"
            >
              <ICoins size={17} />
            </button>
          )}
          <button title={chat.muted ? "Включить уведомления" : "Без уведомлений"} onClick={() => a.toggleChat(chat.id, "muted")} className="btn-ghost w-9 h-9 rounded-xl grid place-items-center">
            {chat.muted ? <IBellOff size={17} /> : <IBell size={17} />}
          </button>
          {chat.kind === "dm" && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-gold/70 pl-1" title="Сквозное шифрование">
              <ILock size={13} /> E2E
            </span>
          )}
        </div>
      </header>

      {/* сообщения */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-1 bg-grid/40">
        {grouped.map((g) => (
          <div key={g.day}>
            <div className="sticky top-1 z-10 flex justify-center my-3">
              <span className="glass rounded-full px-3.5 py-1 text-[11px] font-semibold text-silver/80 tracking-wide">{g.day}</span>
            </div>
            {g.items.map((m, i) => {
              const prev = g.items[i - 1];
              const showAuthor = chat.kind !== "dm" && m.authorId !== prev?.authorId && !(m.kind === "edict" || m.kind === "law");
              return (
                <Bubble
                  key={m.id}
                  msg={m}
                  chat={chat}
                  showAuthor={showAuthor}
                  flash={flashId === m.id}
                  onJump={jumpTo}
                  meRankLvl={RANK_LVL[me.rank]}
                />
              );
            })}
          </div>
        ))}
        {typingWho && (
          <div className="flex items-end gap-2 mt-2 anim-msg">
            <div className="w-7 h-7 rounded-lg grid place-items-center text-sm shrink-0" style={chatAvatarStyle(chat)}>
              {state.citizens[typingWho]?.emoji ?? chat.emoji}
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* композер */}
      {chat.readonly ? (
        <div className="glass border-t border-line/50 px-5 py-4 text-center">
          <div className="text-[13px] text-mut flex items-center justify-center gap-2">
            <ILock size={14} className="text-gold/80" />
            {chat.id === "ch-emperor" ? "Канал только для чтения — Слово Императора неоспоримо" : "Канал только для чтения"}
          </div>
          {chat.id === "ch-market" && (
            <button onClick={() => a.ui({ modal: "market" })} className="btn-gold h-10 px-6 rounded-xl text-sm font-bold mt-3 inline-flex items-center gap-2">
              <IMega size={16} /> Открыть Рынок Гипериона
            </button>
          )}
        </div>
      ) : (
        <Composer chatId={chat.id} />
      )}
    </section>
  );
}

/* ============ пузырь сообщения ============ */
function Bubble({ msg, chat, showAuthor, flash, onJump, meRankLvl }: {
  msg: Message; chat: Chat; showAuthor: boolean; flash: boolean; onJump: (id: string) => void; meRankLvl: number;
}) {
  const { state, a } = useStore();
  const [acts, setActs] = useState(false);
  const author = state.citizens[msg.authorId];
  const mine = !!msg.mine;

  if ((msg.kind === "edict" || msg.kind === "law") && msg.deleted) {
    return (
      <div id={`msg-${msg.id}`} className="flex justify-center my-3">
        <div className="glass rounded-full px-4 py-1.5 text-[12px] italic text-mut anim-msg">🚫 Указ отозван Империей</div>
      </div>
    );
  }

  if (msg.kind === "edict" || msg.kind === "law") {
    const isEdict = msg.kind === "edict";
    return (
      <div id={`msg-${msg.id}`} className={`flex justify-center my-3 ${flash ? "anim-flash rounded-xl" : ""}`}>
        <div className={`max-w-xl w-full sm:w-auto rounded-2xl px-5 py-4 anim-msg ${isEdict ? "glass-strong gold-frame" : "glass border-azure/25"}`}>
          <div className={`flex items-center gap-2 text-[10.5px] uppercase tracking-[0.25em] ${isEdict ? "text-gold" : "text-azure"}`}>
            {isEdict ? "👑 Слово Императора" : "📜 Вестник Закона"}
            <span className="ml-auto normal-case tracking-normal text-mut">{fmtClock(msg.ts)}</span>
          </div>
          <p className="mt-2 text-[14.5px] leading-relaxed font-display italic text-body">{msg.text}</p>
        </div>
      </div>
    );
  }

  const isChannelPost = chat.kind === "channel";
  const canModerate = meRankLvl >= 3 && chat.kind !== "dm";
  const editable = mine && Date.now() - msg.ts < 5 * 60_000;

  const replySrc = msg.replyTo ? (state.messages[chat.id] ?? []).find((x) => x.id === msg.replyTo) : undefined;

  return (
    <div id={`msg-${msg.id}`} className={`group flex ${mine ? "justify-end" : "justify-start"} ${flash ? "anim-flash rounded-xl" : ""}`}>
      {!mine && chat.kind !== "dm" && (
        <div className="w-7 h-7 rounded-lg grid place-items-center text-sm shrink-0 mt-auto mr-2 mb-0.5" style={chatAvatarStyle(isChannelPost ? chat : { ...chat, hue: author?.hue ?? chat.hue, emoji: author?.emoji ?? chat.emoji })}>
          {isChannelPost ? chat.emoji : author?.emoji ?? "👤"}
        </div>
      )}
      <div className={`relative max-w-[86%] sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
        <div
          onClick={() => setActs((v) => !v)}
          className={`rounded-2xl px-3.5 py-2.5 anim-msg cursor-pointer ${
            mine
              ? "rounded-br-md bg-gradient-to-br from-[#3d3a12] to-[#232007] border border-gold/25 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              : "rounded-bl-md glass"
          } ${msg.deleted ? "opacity-70" : ""}`}
        >
          {showAuthor && !mine && (
            <div className="text-[12px] font-bold mb-1" style={{ color: RANK_META[author?.rank ?? "ГРАЖДАНИН"].color }}>
              {isChannelPost ? chat.title : author?.name ?? "Гражданин"}
              {isChannelPost && <IVerified size={12} className="inline ml-1 text-gold" />}
            </div>
          )}

          {replySrc && (
            <button onClick={() => onJump(replySrc.id)} className="w-full text-left mb-1.5 rounded-lg border-l-2 border-gold/70 bg-gold/[0.07] px-2.5 py-1.5 hover:bg-gold/[0.13] transition-colors">
              <div className="text-[10.5px] font-bold text-gold">{replySrc.mine ? "Вы" : state.citizens[replySrc.authorId]?.name?.split(" ")[0] ?? "Гражданин"}</div>
              <div className="text-[12px] text-mut truncate">{replySrc.deleted ? "сообщение удалено" : replySrc.text || (replySrc.kind === "image" ? "📷 Фотография" : replySrc.kind === "voice" ? "🎙 Голосовое" : replySrc.kind === "file" ? "📎 Файл" : "💰 Перевод")}</div>
            </button>
          )}

          {msg.deleted ? (
            <div className="text-[13.5px] italic text-mut flex items-center gap-2">🚫 Сообщение удалено</div>
          ) : (
            <>
              {msg.kind === "transfer" && (
                <div className="rounded-xl bg-gold/[0.1] border border-gold/30 px-4 py-3 my-0.5 min-w-[220px]">
                  <div className="text-[10.5px] uppercase tracking-[0.2em] text-gold/80">Перевод • Казначейство</div>
                  <div className="font-display font-black text-2xl text-gold mt-1">{msg.transfer?.amount} HYPER</div>
                  {msg.transfer?.note && <div className="text-[12.5px] text-goldsoft/80 mt-1">«{msg.transfer.note}»</div>}
                  <div className="text-[10.5px] text-mut mt-1.5 flex items-center gap-1"><ICheck size={11} /> исполнено • пошлина 0%</div>
                </div>
              )}
              {msg.kind === "image" && msg.image && (
                <img src={msg.image} alt={msg.text || "изображение"} className="rounded-xl max-h-72 w-full object-cover mb-1 border border-gold/15" loading="lazy" />
              )}
              {msg.kind === "file" && msg.file && (
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-line/70 px-3 py-2.5 my-0.5">
                  <div className="w-10 h-10 rounded-lg bg-azure/15 text-azure grid place-items-center shrink-0"><IDoc size={20} /></div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">{msg.file.name}</div>
                    <div className="text-[11px] text-mut">{msg.file.size}</div>
                  </div>
                  <button
                    onClick={() => a.toast("success", "Файл сохранён", `${msg.file?.name} • хранилище S3 Империи`)}
                    className="ml-auto btn-ghost w-8 h-8 rounded-lg grid place-items-center shrink-0"
                  >
                    <IDownload size={15} />
                  </button>
                </div>
              )}
              {msg.kind === "voice" && msg.voice && <VoicePlayer voice={msg.voice} mine={mine} />}
              {msg.text && (
                <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                  <RichText text={msg.text} />
                </div>
              )}
            </>
          )}

          <div className={`flex items-center gap-1.5 mt-1 ${mine ? "justify-end" : ""}`}>
            {msg.edited && <span className="text-[10px] text-mut italic">изменено</span>}
            <span className="text-[10.5px] text-mut">{fmtClock(msg.ts)}</span>
            {mine && !msg.deleted && (
              <span className={msg.status === "read" ? "text-gold" : "text-silver/60"}>
                {msg.status === "sending" ? <IClock size={13} /> : msg.status === "sent" ? <ICheck size={13} /> : <IChecks size={15} />}
              </span>
            )}
          </div>
        </div>

        {/* тулбар действий */}
        {!msg.deleted && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${mine ? "right-full mr-2" : "left-full ml-2"} ${acts ? "flex anim-pop" : "hidden group-hover:flex"} items-center gap-0.5 glass-strong rounded-xl p-1 z-20`}>
            <ToolBtn title="Ответить" onClick={() => a.ui({ replyTo: msg.id, editingId: null })}><IReply size={15} /></ToolBtn>
            <ToolBtn title="Переслать" onClick={() => a.ui({ forwardMsg: msg, modal: "transfer", modalChatId: null })}><IForward size={15} /></ToolBtn>
            <ToolBtn
              title="Копировать"
              onClick={() => {
                try { navigator.clipboard?.writeText(msg.text); } catch { /* noop */ }
                a.toast("info", "Скопировано", "Текст в буфере обмена Империи.");
              }}
            >
              <ICopy size={15} />
            </ToolBtn>
            {mine && editable && (
              <ToolBtn title="Редактировать (5 мин)" onClick={() => a.ui({ editingId: msg.id, replyTo: null })}><IPen size={15} /></ToolBtn>
            )}
            {(mine || canModerate) && (
              <ToolBtn title={mine ? "Удалить" : "Удалить (модерация)"} danger onClick={() => a.deleteMessage(chat.id, msg.id)}><ITrash size={15} /></ToolBtn>
            )}
            {!mine && chat.kind !== "dm" && (
              <ToolBtn title="Пожаловаться" danger onClick={() => a.ui({ modal: "report", reportTarget: { chatId: chat.id, msgId: msg.id } })}><IFlag size={15} /></ToolBtn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ children, title, onClick, danger }: { children: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick} className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${danger ? "text-mut hover:text-ember hover:bg-ember/15" : "text-mut hover:text-gold hover:bg-gold/12"}`}>
      {children}
    </button>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(@[\wА-Яа-яЁё«»-]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("@") ? (
          <span key={i} className="text-gold font-semibold">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ============ голосовое ============ */
function VoicePlayer({ voice, mine }: { voice: { duration: number; waveform: number[] }; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const iv = window.setInterval(() => {
      setProg((p) => {
        const np = p + 0.1 / voice.duration;
        if (np >= 1) {
          setPlaying(false);
          return 0;
        }
        return np;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [playing, voice.duration]);
  const shown = Math.floor(prog * voice.duration);
  return (
    <div className="flex items-center gap-3 py-1">
      <button
        onClick={() => setPlaying((v) => !v)}
        className={`w-10 h-10 rounded-full grid place-items-center shrink-0 transition-all ${mine ? "bg-gold text-ink hover:shadow-[0_0_18px_rgba(255,215,0,0.5)]" : "bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25"}`}
      >
        {playing ? <IPause size={16} /> : <IPlay size={16} />}
      </button>
      <div className="flex items-end gap-[2.5px] h-7">
        {voice.waveform.map((h, i) => (
          <span
            key={i}
            className="wave-bar w-[3px]"
            style={{ height: `${h}px`, opacity: i / voice.waveform.length <= prog ? 1 : 0.3, color: mine ? "#ffd700" : "#c0c0c0" }}
          />
        ))}
      </div>
      <span className="text-[11px] text-mut tabular-nums w-9">{playing ? `0:${String(shown).padStart(2, "0")}` : `0:${String(voice.duration).padStart(2, "0")}`}</span>
    </div>
  );
}

/* ============ композер ============ */
function Composer({ chatId }: { chatId: string }) {
  const { state, a } = useStore();
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recording, setRecording] = useState<number | null>(null);
  const [recSec, setRecSec] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const chat = state.chats[chatId];
  const editing = state.ui.editingId ? (state.messages[chatId] ?? []).find((m) => m.id === state.ui.editingId) : null;
  const replyTo = state.ui.replyTo ? (state.messages[chatId] ?? []).find((m) => m.id === state.ui.replyTo) : null;
  const me = state.citizens[ME];

  useEffect(() => {
    if (editing) {
      setText(editing.text);
      taRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (recording === null) return;
    const iv = window.setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  const autoGrow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const submit = () => {
    const t = text.trim();
    if (editing) {
      if (t) a.editMessage(chatId, editing.id, t);
      setText("");
      autoGrow();
      return;
    }
    if (!t) return;
    const ok = a.sendMessage(chatId, { text: t, replyTo: state.ui.replyTo ?? undefined });
    if (ok) {
      setText("");
      requestAnimationFrame(autoGrow);
    }
  };

  const sendVoice = () => {
    const dur = Math.min(59, Math.max(1, recSec));
    const waveform = Array.from({ length: 28 }, () => 6 + Math.floor(Math.random() * 16));
    a.sendMessage(chatId, { kind: "voice", voice: { duration: dur, waveform }, text: "" });
    setRecording(null);
    setRecSec(0);
  };

  /* упоминания */
  const mentionMatch = /(^|\s)@([\wА-Яа-яЁё]*)$/.exec(text);
  const mentionCandidates = useMemo(() => {
    if (!mentionMatch || chat.kind === "dm") return [];
    const frag = mentionMatch[2].toLowerCase();
    return chat.memberIds
      .map((id) => state.citizens[id])
      .filter((c) => c && c.name.toLowerCase().includes(frag))
      .slice(0, 4);
  }, [mentionMatch?.[2], chat, state.citizens]);

  const insertMention = (name: string) => {
    setText((t) => t.replace(/@[\wА-Яа-яЁё]*$/, `@${name.split(" ")[0]} `));
    taRef.current?.focus();
  };

  const insertEmoji = (e: string) => {
    setText((t) => t + e);
    taRef.current?.focus();
  };

  return (
    <div className="relative glass border-t border-line/50 px-3 sm:px-4 py-3 shrink-0 z-20">
      {/* баннер ответа/редактирования */}
      {(replyTo || editing) && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border-l-2 border-gold bg-gold/[0.07] px-3 py-2 anim-fade">
          {editing ? <IPen size={16} className="text-gold shrink-0" /> : <IReply size={16} className="text-gold shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gold">{editing ? "Редактирование сообщения" : `Ответ: ${replyTo?.mine ? "Вы" : state.citizens[replyTo!.authorId]?.name?.split(" ")[0] ?? "Гражданин"}`}</div>
            <div className="text-[12px] text-mut truncate">{editing ? editing.text : replyTo?.text || "вложение"}</div>
          </div>
          <button onClick={() => { a.ui({ replyTo: null, editingId: null }); setText(""); }} className="text-mut hover:text-ember"><ITrash size={15} /></button>
        </div>
      )}

      {/* подсказка упоминаний */}
      {mentionCandidates.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 glass-strong gold-frame rounded-xl p-1.5 anim-pop z-30">
          {mentionCandidates.map((c) => (
            <button key={c.id} onClick={() => insertMention(c.name)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gold/10 transition-colors text-left">
              <span className="text-lg">{c.emoji}</span>
              <span className="text-[13px] font-semibold truncate">{c.name}</span>
              <span className="ml-auto text-[9.5px] font-bold" style={{ color: RANK_META[c.rank].color }}>{c.rank}</span>
            </button>
          ))}
        </div>
      )}

      {recording !== null ? (
        <div className="flex items-center gap-4 px-2 anim-fade">
          <button onClick={() => { setRecording(null); setRecSec(0); }} className="btn-ghost w-10 h-10 rounded-xl grid place-items-center text-ember" title="Отменить">
            <ITrash size={18} />
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-ember" style={{ animation: "rec-pulse 1s infinite" }} />
          <span className="font-display font-bold text-lg tabular-nums">0:{String(recSec).padStart(2, "0")}</span>
          <span className="text-[12px] text-mut hidden sm:inline">Запись голосового послания… Говорите во славу Империи</span>
          <button onClick={sendVoice} className="ml-auto btn-gold h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2">
            <IStop size={15} /> Отправить
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-0.5">
            <button onClick={() => { setEmojiOpen((v) => !v); setAttachOpen(false); }} className={`w-10 h-10 rounded-xl grid place-items-center transition-colors ${emojiOpen ? "text-gold bg-gold/12" : "text-mut hover:text-gold"}`} title="Эмодзи">
              <ISmile size={21} />
            </button>
            <button onClick={() => { setAttachOpen((v) => !v); setEmojiOpen(false); }} className={`w-10 h-10 rounded-xl grid place-items-center transition-colors ${attachOpen ? "text-gold bg-gold/12" : "text-mut hover:text-gold"}`} title="Прикрепить">
              <IClip size={20} />
            </button>
          </div>
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            onChange={(e) => { setText(e.target.value); autoGrow(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={chat.kind === "province" ? "Голос провинции…" : editing ? "Правка послания…" : "Послание… (@ — упомянуть)"}
            className="flex-1 resize-none bg-white/[0.045] border border-line/70 focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)] outline-none rounded-xl px-4 py-2.5 text-[14.5px] leading-relaxed transition-all max-h-[140px]"
          />
          {text.trim() ? (
            <button onClick={submit} className="btn-gold w-11 h-11 rounded-xl grid place-items-center shrink-0" title={editing ? "Сохранить" : "Отправить"}>
              {editing ? <ICheck size={19} /> : <ISend size={19} />}
            </button>
          ) : (
            <button onClick={() => { setRecording(Date.now()); setRecSec(0); }} className="w-11 h-11 rounded-xl grid place-items-center shrink-0 text-mut hover:text-gold hover:bg-gold/10 transition-colors border border-line/70" title="Голосовое сообщение">
              <IMic size={20} />
            </button>
          )}
        </div>
      )}

      {/* эмодзи */}
      {emojiOpen && <EmojiPicker onPick={(e) => insertEmoji(e)} onClose={() => setEmojiOpen(false)} />}
      {/* вложения */}
      {attachOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAttachOpen(false)} />
          <div className="absolute bottom-16 left-3 z-40 w-[300px] glass-strong gold-frame rounded-2xl p-3 anim-pop">
            <div className="text-[10.5px] uppercase tracking-[0.25em] text-mut px-1 pb-2">Фотографии Империи</div>
            <div className="grid grid-cols-2 gap-2">
              {IMAGES.map((im) => (
                <button
                  key={im.url}
                  onClick={() => { a.sendMessage(chatId, { kind: "image", image: im.url, text: "" }); setAttachOpen(false); }}
                  className="rounded-xl overflow-hidden border border-gold/20 hover:border-gold/60 transition-all hover:scale-[1.02] group"
                >
                  <img src={im.url} alt={im.name} className="h-20 w-full object-cover" />
                  <div className="text-[10.5px] text-mut px-2 py-1 truncate group-hover:text-gold transition-colors">{im.name}</div>
                </button>
              ))}
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.25em] text-mut px-1 pt-3 pb-1.5">Документы • S3</div>
            <div className="space-y-1">
              {FAKE_DOCS.map((d) => (
                <button
                  key={d.name}
                  onClick={() => { a.sendMessage(chatId, { kind: "file", file: d, text: "" }); setAttachOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gold/10 transition-colors text-left"
                >
                  <IDoc size={16} className="text-azure shrink-0" />
                  <span className="text-[12.5px] truncate flex-1">{d.name}</span>
                  <span className="text-[10.5px] text-mut">{d.size}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  const [cat, setCat] = useState(0);
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-16 left-3 z-40 w-[320px] glass-strong gold-frame rounded-2xl p-3 anim-pop">
        <div className="flex gap-1 mb-2">
          {EMOJI_CATS.map((c, i) => (
            <button key={c.name} onClick={() => setCat(i)} className={`px-2.5 h-8 rounded-lg text-sm transition-colors ${cat === i ? "bg-gold/15 border border-gold/40" : "hover:bg-white/5 border border-transparent"}`} title={c.name}>
              {c.icon}
            </button>
          ))}
          <span className="ml-auto text-[10.5px] text-mut self-center pr-1">{EMOJI_CATS[cat].name}</span>
        </div>
        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
          {EMOJI_CATS[cat].list.map((e, i) => (
            <button key={i} onClick={() => onPick(e)} className="h-9 rounded-lg grid place-items-center text-[19px] hover:bg-gold/15 hover:scale-110 transition-all">
              {e}
            </button>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-line/50 text-[10.5px] text-mut px-1">Полная поддержка Unicode — пишите любые эмодзи в послании</div>
      </div>
    </>
  );
}
