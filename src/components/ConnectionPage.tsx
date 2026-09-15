import { useState } from "react";
import { useStore } from "../store";
import { getSavedConfig, saveConfig, testConnection, initSupabase, syncData, clearConfig } from "../lib/supabase";
import { IChevL, ILock, ISignal, IX } from "../icons";

export default function ConnectionPage() {
  const { state, a } = useStore();
  const savedConfig = getSavedConfig();
  const [url, setUrl] = useState(savedConfig?.url || "");
  const [key, setKey] = useState(savedConfig?.key || "");
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTest = async () => {
    if (!url || !key) {
      setStatus("error");
      setErrorMsg("Заполните оба поля");
      return;
    }
    setTesting(true);
    setStatus("testing");
    const ok = await testConnection(url, key);
    setTesting(false);
    if (ok) {
      setStatus("success");
      saveConfig({ url, key, connected: true, connectedAt: Date.now() });
      initSupabase(url, key);
    } else {
      setStatus("error");
      setErrorMsg("Не удалось подключиться. Проверьте URL и API ключ.");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncData(url, key, {
      chats: state.chats,
      messages: state.messages,
      citizens: state.citizens,
    });
    setSyncing(false);
    if (result.success) {
      a.toast("success", "Синхронизация завершена", "Все данные успешно сохранены в Supabase.");
    } else {
      a.toast("warning", "Ошибка синхронизации", result.error || "Неизвестная ошибка");
    }
  };

  const handleDisconnect = () => {
    clearConfig();
    setUrl("");
    setKey("");
    setStatus("idle");
    a.toast("info", "Отключено", "Соединение с Supabase разорвано.");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-gold/15 px-6 py-4 flex items-center gap-4">
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IChevL size={20} />
        </button>
        <div className="flex-1">
          <div className="font-display font-bold text-xl flex items-center gap-2">
            <ISignal size={22} className="text-gold" />
            Подключение к серверу
          </div>
          <div className="text-[11px] text-mut">Синхронизация с Supabase</div>
        </div>
        <button onClick={() => a.ui({ modal: null })} className="w-10 h-10 rounded-xl grid place-items-center text-silver hover:text-gold hover:bg-gold/10 transition-colors">
          <IX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Connection Status */}
        {savedConfig?.connected && (
          <div className="glass rounded-xl p-4 border border-mint/30 bg-mint/[0.05]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-mint animate-pulse" />
              <div className="flex-1">
                <div className="font-bold text-[14px] text-mint">Подключено</div>
                <div className="text-[11px] text-mut">Соединение активно с {new Date(savedConfig.connectedAt).toLocaleString("ru-RU")}</div>
              </div>
              <button onClick={handleDisconnect} className="btn-ghost h-9 px-4 rounded-xl text-[12px] text-ember border-ember/30 hover:bg-ember/10">
                Отключить
              </button>
            </div>
          </div>
        )}

        {/* URL Field */}
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80 flex items-center gap-2">
            <ILock size={12} /> Supabase URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxxxx.supabase.co"
            className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[14px] font-mono"
            disabled={savedConfig?.connected}
          />
          <div className="text-[10.5px] text-mut mt-1.5">
            Найдите в Settings → API → Project URL
          </div>
        </div>

        {/* Key Field */}
        <div>
          <label className="text-[11px] uppercase tracking-widest text-silver/80 flex items-center gap-2">
            <ILock size={12} /> API Key (anon/public)
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[14px] font-mono"
            disabled={savedConfig?.connected}
          />
          <div className="text-[10.5px] text-mut mt-1.5">
            Найдите в Settings → API → anon public key
          </div>
        </div>

        {/* Status Message */}
        {status === "success" && (
          <div className="glass rounded-xl p-4 border border-mint/30 bg-mint/[0.05] anim-fade">
            <div className="text-[13px] text-mint font-semibold">✓ Соединение установлено!</div>
          </div>
        )}
        {status === "error" && (
          <div className="glass rounded-xl p-4 border border-ember/30 bg-ember/[0.05] anim-fade">
            <div className="text-[13px] text-ember font-semibold">⚠ {errorMsg}</div>
          </div>
        )}

        {/* Action Buttons */}
        {!savedConfig?.connected ? (
          <button
            onClick={handleTest}
            disabled={testing || !url || !key}
            className="btn-gold w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Проверка соединения...
              </>
            ) : (
              <>
                <ISignal size={18} />
                Подключиться
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
                Синхронизировать данные
              </>
            )}
          </button>
        )}

        {/* Instructions */}
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="font-display font-bold text-[15px] text-gold">Инструкция по подключению</div>
          <ol className="text-[12.5px] text-silver/85 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Создайте проект на <a href="https://supabase.com" target="_blank" rel="noopener" className="text-gold hover:underline">supabase.com</a></li>
            <li>В SQL Editor выполните скрипт создания таблиц (см. ниже)</li>
            <li>Скопируйте Project URL и anon public key</li>
            <li>Вставьте их в поля выше и нажмите "Подключиться"</li>
            <li>Нажмите "Синхронизировать данные" для сохранения</li>
          </ol>
        </div>

        {/* SQL Script */}
        <div className="glass rounded-xl p-5">
          <div className="font-display font-bold text-[15px] text-gold mb-3">SQL для создания таблиц</div>
          <pre className="text-[11px] text-silver/80 bg-ink2 rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
{`-- Таблица пользователей
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  rank TEXT,
  hue INTEGER,
  emoji TEXT,
  presence TEXT,
  "lastSeen" BIGINT,
  light INTEGER DEFAULT 0
);

-- Таблица чатов
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT,
  hue INTEGER,
  "memberIds" TEXT[],
  subscribers INTEGER,
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  muted BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  readonly BOOLEAN DEFAULT FALSE,
  description TEXT
);

-- Таблица сообщений
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  "authorId" TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,
  text TEXT,
  ts BIGINT NOT NULL,
  status TEXT DEFAULT 'sent',
  mine BOOLEAN DEFAULT FALSE,
  edited BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  "replyTo" TEXT,
  image TEXT,
  file JSONB,
  voice JSONB,
  "transfer" JSONB
);

-- Индексы для производительности
CREATE INDEX idx_messages_chatId ON messages("chatId");
CREATE INDEX idx_messages_ts ON messages(ts);`}
          </pre>
        </div>

        {/* Link to Imperium Hyperion */}
        <div className="glass rounded-xl p-5 border border-gold/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛</span>
            <div className="flex-1">
              <div className="font-display font-bold text-[14px]">Империя Гиперион</div>
              <div className="text-[11px] text-mut">Главный портал государства</div>
            </div>
            <a
              href="https://hyperion612.github.io/Imperium_Hyperion/"
              target="_blank"
              rel="noopener"
              className="btn-ghost h-9 px-4 rounded-xl text-[12px] font-semibold"
            >
              Открыть →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
