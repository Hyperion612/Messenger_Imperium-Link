import { StoreProvider, useStore } from "./store";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import OverlayHost from "./components/Overlays";
import { IChat, ICoins, ISearch, IStore, ImperialSeal } from "./icons";
import { RANK_META } from "./data/seed";

const ME = "HIT-77777";

function Embers({ count = 10 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${(i * 9.7 + 5) % 100}%`,
            ["--ember-t" as string]: `${14 + (i % 6) * 3}s`,
            ["--ember-d" as string]: `${-i * 2.7}s`,
            ["--ember-o" as string]: 0.18 + (i % 4) * 0.1,
            ["--ember-x" as string]: `${(i % 2 ? 1 : -1) * (18 + i * 3)}px`,
          }}
        />
      ))}
    </>
  );
}

function Rail() {
  const { state, a } = useStore();
  const me = state.citizens[ME];
  const unread = Object.entries(state.unread).reduce((acc, [id, n]) => acc + (state.chats[id]?.archived ? 0 : n), 0);

  const Btn = ({ icon, label, onClick, active, badge }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; badge?: number }) => (
    <button
      onClick={onClick}
      title={label}
      className={`relative w-11 h-11 rounded-xl grid place-items-center transition-all duration-200 ${
        active ? "bg-gold text-ink shadow-[0_4px_20px_rgba(255,215,0,0.35)]" : "text-silver/70 hover:text-gold hover:bg-gold/[0.08]"
      }`}
    >
      {icon}
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[10px] font-bold grid place-items-center border-2 border-ink">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* десктоп-рейл */}
      <nav className="hidden md:flex flex-col items-center w-[68px] shrink-0 border-r border-line/50 glass relative z-10 py-4 gap-2">
        <button onClick={() => a.ui({ modal: "profile" })} title="Профиль Империи" className="mb-2 hover:scale-105 transition-transform">
          <ImperialSeal size={40} />
        </button>
        <div className="w-8 h-px bg-line/70 mb-1" />
        <Btn icon={<IChat size={20} />} label="Чаты" onClick={() => a.closeChat()} active={!state.ui.modal && !state.ui.activeChatId} badge={unread} />
        <Btn icon={<ISearch size={20} />} label="Поиск по Империи" onClick={() => a.ui({ modal: "search" })} active={state.ui.modal === "search"} />
        <Btn icon={<ICoins size={20} />} label="Казначейство" onClick={() => a.ui({ modal: "treasury" })} active={state.ui.modal === "treasury"} />
        <Btn icon={<IStore size={20} />} label="Рынок Гипериона" onClick={() => a.ui({ modal: "market" })} active={state.ui.modal === "market"} />
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-[9px] text-mut" title="Соединение стабильно">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          </div>
          <button
            onClick={() => a.ui({ modal: "profile" })}
            title={`${me.name} • ${me.rank}`}
            className="relative w-11 h-11 rounded-xl grid place-items-center text-xl transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, hsl(${me.hue} 60% 24%), hsl(${me.hue + 40} 60% 12%))`,
              boxShadow: `0 0 0 1.5px ${RANK_META[me.rank].color}88`,
            }}
          >
            {me.emoji}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-mint border-2 border-ink" />
          </button>
        </div>
      </nav>

      {/* мобильная нижняя панель */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-gold/15 h-[62px] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        <Btn icon={<IChat size={21} />} label="Чаты" onClick={() => { a.ui({ modal: null }); a.closeChat(); }} active={!state.ui.modal && !state.ui.activeChatId} badge={unread} />
        <Btn icon={<ISearch size={21} />} label="Поиск" onClick={() => a.ui({ modal: "search" })} active={state.ui.modal === "search"} />
        <button onClick={() => a.ui({ modal: "profile" })} className="relative -mt-6 w-14 h-14 rounded-2xl grid place-items-center text-2xl"
          style={{ background: `linear-gradient(135deg, hsl(${me.hue} 60% 24%), hsl(${me.hue + 40} 60% 12%))`, boxShadow: `0 0 0 2px ${RANK_META[me.rank].color}, 0 6px 24px rgba(0,0,0,0.5)` }}>
          {me.emoji}
        </button>
        <Btn icon={<ICoins size={21} />} label="Казначейство" onClick={() => a.ui({ modal: "treasury" })} active={state.ui.modal === "treasury"} />
        <Btn icon={<IStore size={21} />} label="Рынок" onClick={() => a.ui({ modal: "market" })} active={state.ui.modal === "market"} />
      </nav>
    </>
  );
}

function Shell() {
  const { state } = useStore();
  if (!state.session) {
    return (
      <>
        <Login />
        <OverlayHost />
      </>
    );
  }
  return (
    <div className="h-full bg-imperial relative overflow-hidden flex">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <Embers />
      <Rail />
      <div className="flex-1 flex min-w-0 relative pb-[62px] md:pb-0">
        <Sidebar />
        <ChatView />
      </div>
      <OverlayHost />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
