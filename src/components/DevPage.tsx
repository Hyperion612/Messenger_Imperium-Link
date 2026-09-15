import { useEffect, useState } from "react";
import { useStore } from "../store";
import {
  getIntegrationConfig,
  saveIntegrationConfig,
  clearIntegrationConfig,
  testImperiumConnection,
  fetchCitizenData,
  syncWithImperium,
} from "../lib/imperium";
import { IChevL, ILandmark, ISignal, IX, ICheck, IArrowR } from "../icons";

export default function DevPage() {
  const { state, a } = useStore();
  const config = getIntegrationConfig();
  const [citizenId, setCitizenId] = useState(config.citizenId || "HIT-77777");
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "connected" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [citizenData, setCitizenData] = useState<any>(null);

  const handleTest = async () => {
    if (!citizenId.trim()) {
      setStatus("error");
      setErrorMsg("Укажите ID гражданина");
      return;
    }
    setTesting(true);
    setStatus("testing");
    const ok = await testImperiumConnection(citizenId);
    setTesting(false);
    if (ok) {
      setStatus("connected");
      const data = await fetchCitizenData(citizenId);
      setCitizenData(data);
      saveIntegrationConfig({
        connected: true,
        lastSync: Date.now(),
        citizenId,
      });
    } else {
      setStatus("error");
      setErrorMsg("Не удалось подключиться к государству. Проверьте ID гражданина.");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncWithImperium(citizenId, {
      chats: state.chats,
      messages: state.messages,
      balance: state.balance,
      light: state.light,
    });
    setSyncing(false);
    if (result.success) {
      saveIntegrationConfig({ connected: true, lastSync: Date.now(), citizenId });
      a.toast("success", "Синхронизация с Империей", "Данные успешно переданы в Казначейство Гипериона.");
    } else {
      a.toast("warning", "Ошибка синхронизации", result.error || "Не удалось связаться с государством");
    }
  };

  const handleDisconnect = () => {
    clearIntegrationConfig();
    setStatus("idle");
    setCitizenData(null);
    a.toast("info", "Отключено", "Связь с Империей разорвана.");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-gold/15 px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IChevL size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-xl flex items-center gap-2">
            <ILandmark size={22} className="text-gold" />
            Для разработчиков
          </div>
          <div className="text-[11px] text-mut truncate">Интеграция с государством Империя Гиперион</div>
        </div>
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Connection Status */}
        {config.connected && (
          <div className="glass rounded-xl p-4 border border-mint/30 bg-mint/[0.05] anim-fade">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-mint animate-pulse" />
              <div className="flex-1">
                <div className="font-bold text-[14px] text-mint">Связь с Империей установлена</div>
                <div className="text-[11px] text-mut">
                  Последняя синхронизация: {config.lastSync ? new Date(config.lastSync).toLocaleString("ru-RU") : "—"}
                </div>
              </div>
              <button onClick={handleDisconnect} className="btn-ghost h-9 px-4 rounded-xl text-[12px] text-ember border-ember/30 hover:bg-ember/10">
                Отключить
              </button>
            </div>
          </div>
        )}

        {/* Citizen ID */}
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80 flex items-center gap-2">
            <ISignal size={12} /> Гиперион-ID гражданина
          </label>
          <input
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value.toUpperCase())}
            placeholder="HIT-XXXXX"
            className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[14px] font-mono font-bold tracking-wider text-goldsoft"
            maxLength={9}
          />
          <div className="text-[10.5px] text-mut mt-1.5">
            ID из основного портала государства • формат HIT-XXXXX
          </div>
        </div>

        {/* Status */}
        {status === "connected" && (
          <div className="glass rounded-xl p-4 border border-mint/30 bg-mint/[0.05] anim-fade">
            <div className="text-[13px] text-mint font-semibold flex items-center gap-2">
              <ICheck size={14} /> Связь с государством установлена
            </div>
            {citizenData && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                <div className="glass rounded-lg p-2.5">
                  <div className="text-mut">Имя</div>
                  <div className="font-bold text-goldsoft">{citizenData.name || "—"}</div>
                </div>
                <div className="glass rounded-lg p-2.5">
                  <div className="text-mut">Ранг</div>
                  <div className="font-bold text-goldsoft">{citizenData.rank || "—"}</div>
                </div>
                <div className="glass rounded-lg p-2.5">
                  <div className="text-mut">Уровень Света</div>
                  <div className="font-bold text-gold">{citizenData.light ?? "—"}</div>
                </div>
                <div className="glass rounded-lg p-2.5">
                  <div className="text-mut">Баланс HYPER</div>
                  <div className="font-bold text-gold">{citizenData.balance ?? "—"}</div>
                </div>
              </div>
            )}
          </div>
        )}
        {status === "error" && (
          <div className="glass rounded-xl p-4 border border-ember/30 bg-ember/[0.05] anim-fade">
            <div className="text-[13px] text-ember font-semibold">⚠ {errorMsg}</div>
          </div>
        )}

        {/* Actions */}
        {!config.connected ? (
          <button
            onClick={handleTest}
            disabled={testing || !citizenId.trim()}
            className="btn-gold w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Проверка связи...
              </>
            ) : (
              <>
                <ISignal size={18} />
                Подключиться к Империи
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-gold w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2"
          >
            {syncing ? (
              <>
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <ISignal size={18} />
                Синхронизировать с государством
              </>
            )}
          </button>
        )}

        {/* Link to Imperium Hyperion */}
        <a
          href="https://hyperion612.github.io/Imperium_Hyperion/"
          target="_blank"
          rel="noopener"
          className="block glass rounded-xl p-5 border border-gold/20 hover:border-gold/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 grid place-items-center text-gold text-3xl shrink-0">
              🏛
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] group-hover:text-gold transition-colors">
                Империя Гиперион
              </div>
              <div className="text-[11.5px] text-mut mt-0.5 leading-relaxed">
                Государственный портал • Казначейство • Сенат • Рынок
              </div>
              <div className="text-[10.5px] text-gold/70 mt-1 font-mono">
                hyperion612.github.io/Imperium_Hyperion
              </div>
            </div>
            <IArrowR size={18} className="text-mut group-hover:text-gold transition-colors shrink-0" />
          </div>
        </a>

        {/* API Documentation */}
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="font-display font-bold text-[15px] text-gold">API Интеграции</div>
          <div className="text-[12.5px] text-silver/85 leading-relaxed">
            Мессенджер использует следующие эндпоинты государства для синхронизации:
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-silver/70">
              <span className="text-mint">GET</span>
              <span>/api/citizen/:id</span>
            </div>
            <div className="flex items-center gap-2 text-silver/70">
              <span className="text-azure">POST</span>
              <span>/api/sync</span>
            </div>
            <div className="flex items-center gap-2 text-silver/70">
              <span className="text-gold">PATCH</span>
              <span>/api/citizen/:id/balance</span>
            </div>
            <div className="flex items-center gap-2 text-silver/70">
              <span className="text-gold">PATCH</span>
              <span>/api/citizen/:id/light</span>
            </div>
          </div>
        </div>

        {/* GitHub Links */}
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="font-display font-bold text-[15px] text-gold">Репозитории</div>
          <div className="space-y-2">
            <a
              href="https://github.com/Hyperion612/Imperium_Hyperion"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gold/[0.06] transition-colors"
            >
              <span className="text-lg">📦</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">Imperium_Hyperion</div>
                <div className="text-[10.5px] text-mut">Основной портал государства</div>
              </div>
              <IArrowR size={14} className="text-mut" />
            </a>
            <a
              href="https://github.com/Hyperion612/Messenger_Imperium-Link"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gold/[0.06] transition-colors"
            >
              <span className="text-lg">💬</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">Messenger_Imperium-Link</div>
                <div className="text-[10.5px] text-mut">Этот мессенджер</div>
              </div>
              <IArrowR size={14} className="text-mut" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
