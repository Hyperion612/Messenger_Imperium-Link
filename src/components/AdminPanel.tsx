import { useState } from "react";
import { useStore } from "../store";
import { RANK_META, RANK_ORDER } from "../data/seed";
import { IChevL, ICrown, ITrash, IUsers, IX } from "../icons";

const ME = "HIT-77777";

export default function AdminPanel() {
  const { state, a } = useStore();
  const [tab, setTab] = useState<"citizens" | "channels" | "stats">("citizens");
  const me = state.citizens[ME];
  const isAdmin = me.rank === "СЕНАТОР" || me.rank === "ИМПЕРАТОР";

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="font-display font-bold text-2xl text-gold">Доступ запрещён</div>
          <div className="text-mut mt-2">Админ-панель доступна только СЕНАТОРАМ и ИМПЕРАТОРУ</div>
          <button onClick={() => a.ui({ modal: null })} className="btn-ghost mt-6 h-10 px-6 rounded-xl">
            Назад
          </button>
        </div>
      </div>
    );
  }

  const citizens = Object.values(state.citizens).filter((c) => c.id !== ME);
  const channels = Object.values(state.chats);
  const totalMessages = Object.values(state.messages).reduce((sum, msgs) => sum + msgs.length, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="glass-strong border-b border-gold/15 px-6 py-4 flex items-center gap-4">
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IChevL size={20} />
        </button>
        <div className="flex-1">
          <div className="font-display font-bold text-xl flex items-center gap-2">
            <ICrown size={22} className="text-gold" />
            Панель Администратора
          </div>
          <div className="text-[11px] text-mut">Управление Империей Гиперион</div>
        </div>
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IX size={20} />
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 px-6 py-3 border-b border-line/50">
        <button onClick={() => setTab("citizens")} className={`px-4 h-9 rounded-lg text-[13px] font-semibold transition-colors ${tab === "citizens" ? "bg-gold text-ink" : "text-silver/70 hover:text-gold hover:bg-gold/[0.07]"}`}>
          <IUsers size={15} className="inline mr-1.5" />Граждане ({citizens.length})
        </button>
        <button onClick={() => setTab("channels")} className={`px-4 h-9 rounded-lg text-[13px] font-semibold transition-colors ${tab === "channels" ? "bg-gold text-ink" : "text-silver/70 hover:text-gold hover:bg-gold/[0.07]"}`}>
          📣 Каналы ({channels.length})
        </button>
        <button onClick={() => setTab("stats")} className={`px-4 h-9 rounded-lg text-[13px] font-semibold transition-colors ${tab === "stats" ? "bg-gold text-ink" : "text-silver/70 hover:text-gold hover:bg-gold/[0.07]"}`}>
          📊 Статистика
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === "citizens" && (
          <div className="space-y-2">
            {citizens.map((c) => (
              <div key={c.id} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl" style={{ background: `linear-gradient(135deg, hsl(${c.hue} 60% 24%), hsl(${c.hue + 40} 60% 12%))` }}>
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px]">{c.name}</div>
                  <div className="text-[11px] text-mut">{c.id} • {c.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: RANK_META[c.rank].color, borderColor: RANK_META[c.rank].color + "66" }}>
                      {c.rank}
                    </span>
                    <span className="text-[10px] text-mut">Свет: {c.light}</span>
                    <span className={`text-[10px] ${c.presence === "online" ? "text-mint" : "text-mut"}`}>
                      {c.presence === "online" ? "● в сети" : "○ оффлайн"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={c.rank}
                    onChange={(e) => {
                      a.toast("success", "Ранг изменён", `${c.name} теперь ${e.target.value}`);
                    }}
                    className="input-imperial rounded-lg h-9 px-3 text-[12px] bg-panel"
                  >
                    {RANK_ORDER.filter((r) => r !== "ИМПЕРАТОР").map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button className="w-9 h-9 rounded-lg grid place-items-center text-ember hover:bg-ember/10 transition-colors">
                    <ITrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "channels" && (
          <div className="space-y-2">
            {channels.map((ch) => (
              <div key={ch.id} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl grid place-items-center text-2xl" style={{ background: `linear-gradient(135deg, hsl(${ch.hue} 60% 24%), hsl(${ch.hue + 40} 60% 12%))` }}>
                  {ch.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px]">{ch.title}</div>
                  <div className="text-[11px] text-mut">{ch.description}</div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-mut">
                    <span>{ch.kind === "channel" ? "📣 Канал" : ch.kind === "group" ? "⚔️ Группа" : "🏛 Провинция"}</span>
                    <span>👥 {ch.subscribers ?? ch.memberIds.length}</span>
                    <span>💬 {state.messages[ch.id]?.length ?? 0}</span>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-lg grid place-items-center text-ember hover:bg-ember/10 transition-colors">
                  <ITrash size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "stats" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-mut">Граждан</div>
              <div className="font-display font-black text-4xl text-gold mt-2">{citizens.length}</div>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-mut">Каналов</div>
              <div className="font-display font-black text-4xl text-gold mt-2">{channels.length}</div>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-mut">Сообщений</div>
              <div className="font-display font-black text-4xl text-gold mt-2">{totalMessages}</div>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-mut">Онлайн</div>
              <div className="font-display font-black text-4xl text-mint mt-2">
                {citizens.filter((c) => c.presence === "online").length}
              </div>
            </div>
            <div className="glass rounded-xl p-5 sm:col-span-2">
              <div className="text-[11px] uppercase tracking-widest text-mut">Распределение по рангам</div>
              <div className="mt-3 space-y-2">
                {RANK_ORDER.filter((r) => r !== "ИМПЕРАТОР").map((rank) => {
                  const count = citizens.filter((c) => c.rank === rank).length;
                  const pct = citizens.length > 0 ? (count / citizens.length) * 100 : 0;
                  return (
                    <div key={rank}>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span style={{ color: RANK_META[rank].color }}>{rank}</span>
                        <span className="text-mut">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1c1c44] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: RANK_META[rank].color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
