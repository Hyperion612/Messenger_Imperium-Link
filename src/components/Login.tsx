import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { ImperialSeal, Laurel, ILock, IEye, IShield, IArrowR, ISignal, ILandmark, IUsers } from "../icons";

type Phase = "creds" | "2fa" | "recover" | "recoverDone";

const EDICTS_TICKER = [
  "Указ №117 — награды за активность удвоены до конца цикла",
  "Закон HYR-126 — переводы HYPER без пошлин",
  "Врата Аврора ↔ Кристаллис открыты для всех граждан",
  "ИИ-ОКО «Эйдос» отражает 40 000 угроз в секунду",
  "Сенат созывает курию финансов в полдень",
  "Парад легионов в Кристаллисе — в субботу, у Золотых Врат",
];

export default function Login() {
  const { state, a } = useStore();
  const [phase, setPhase] = useState<Phase>("creds");
  const [cid, setCid] = useState("HIT-77777");
  const [pwd, setPwd] = useState("aureum");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const start2fa = () => {
    const idOk = /^HIT-\d{5}$/.test(cid.trim().toUpperCase());
    if (!idOk) {
      setErr("ID гражданина должен иметь формат HIT-XXXXX (пять цифр)");
      setShake((x) => x + 1);
      return;
    }
    if (pwd.length < 4) {
      setErr("Пароль слишком короткий. Демо-пароль: aureum");
      setShake((x) => x + 1);
      return;
    }
    if (pwd !== "aureum") {
      setErr("Неверный пароль. Для демо-доступа используйте aureum");
      setShake((x) => x + 1);
      return;
    }
    setErr("");
    const c = genCode();
    setCode(c);
    setDigits(["", "", "", "", "", ""]);
    setPhase("2fa");
    a.toast("push", "🔐 Гиперион-ID • Push-уведомление", `Код подтверждения входа: ${c}`);
  };

  const submit2fa = (arr: string[]) => {
    const val = arr.join("");
    if (val.length < 6) return;
    if (val === code) {
      a.completeLogin(cid.trim().toUpperCase());
    } else {
      setErr("Неверный код. Проверьте push-уведомление.");
      setShake((x) => x + 1);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
  };

  const onDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setErr("");
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (next.every((x) => x !== "")) submit2fa(next);
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    const next = t.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    if (t.length === 6) submit2fa(next);
    else refs.current[t.length]?.focus();
  };

  const recover = () => {
    if (!/^HIT-\d{5}$/.test(cid.trim().toUpperCase()) || !email.includes("@")) {
      setErr("Укажите корректный ID (HIT-XXXXX) и email");
      setShake((x) => x + 1);
      return;
    }
    setErr("");
    setPhase("recoverDone");
    a.toast("info", "📮 Почта Империи", `Ссылка для восстановления пароля отправлена на ${email}`);
  };

  const onlineCount = useMemo(
    () => Object.values(state.citizens).filter((c) => c.presence === "online").length * 12847 + 3120,
    [state.citizens]
  );

  return (
    <div className="h-full bg-imperial relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${(i * 7.3 + 3) % 100}%`,
            ["--ember-t" as string]: `${12 + (i % 7) * 3}s`,
            ["--ember-d" as string]: `${-i * 2.2}s`,
            ["--ember-o" as string]: 0.25 + (i % 4) * 0.12,
            ["--ember-x" as string]: `${(i % 2 ? 1 : -1) * (20 + i * 4)}px`,
          }}
        />
      ))}

      <div className="relative h-full max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[1.15fr_1fr] items-center gap-10 overflow-y-auto">
        {/* ===== имперская панель ===== */}
        <div className="hidden lg:flex flex-col justify-center py-10 anim-rise">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 grid place-items-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-gold/40 spin-slow" />
              <ImperialSeal size={76} className="glow-breathe" />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.42em] text-silver/70 uppercase">Цифровое государство • Гиперион</div>
              <h1 className="font-display font-black text-5xl xl:text-6xl leading-[1.02] mt-1.5">
                Империум <span className="shimmer-text">Линк</span>
              </h1>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mut">
            Единая защищённая связь Империи: личные переписки с оконечным шифрованием, комнаты
            провинций, каналы Сената и слово Императора — в одном приложении. Веб и мобильные
            платформы, доставка сообщений быстрее удара сердца.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            {[
              { icon: <IUsers size={18} />, v: onlineCount.toLocaleString("ru-RU"), l: "граждан в сети" },
              { icon: <ILandmark size={18} />, v: "4", l: "провинции на связи" },
              { icon: <ISignal size={18} />, v: "< 100 мс", l: "доставка сообщения" },
            ].map((s2) => (
              <div key={s2.l} className="glass rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-2 text-gold/80">{s2.icon}<span className="text-[10px] uppercase tracking-wider text-mut">live</span></div>
                <div className="font-display font-bold text-xl text-body mt-1">{s2.v}</div>
                <div className="text-[11px] text-mut">{s2.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-xl glass gold-frame rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line/60 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold/90">Имперские указы • эфир</span>
              <span className="flex items-center gap-1.5 text-[10px] text-mint"><span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />LIVE</span>
            </div>
            <div className="h-24 overflow-hidden relative">
              <div className="ticker-track absolute inset-x-0 top-0">
                {[...EDICTS_TICKER, ...EDICTS_TICKER].map((t, i) => (
                  <div key={i} className="px-4 py-2 text-[13px] text-silver/85 flex items-center gap-2">
                    <span className="text-gold">⚜</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== форма ===== */}
        <div className="flex items-center justify-center py-8 lg:py-0">
          <div key={shake} className={`w-full max-w-md glass-strong gold-frame rounded-2xl p-7 sm:p-8 anim-slide-left ${shake ? "anim-shake" : ""}`}>
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <ImperialSeal size={44} />
              <div>
                <div className="font-display font-extrabold text-2xl leading-none">Империум <span className="text-gold">Линк</span></div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-mut mt-1">Империя Гиперион</div>
              </div>
            </div>

            {phase === "creds" && (
              <>
                <h2 className="font-display font-bold text-3xl">Вход в цитадель</h2>
                <p className="text-sm text-mut mt-1.5">Предъявите Гиперион-ID и пароль. Сессия действует 24 часа.</p>
                <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); start2fa(); }}>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-silver/80">ID гражданина</label>
                    <div className="mt-1.5 flex items-center gap-2 input-imperial rounded-xl px-3.5 h-12">
                      <IUserMini />
                      <input
                        value={cid}
                        onChange={(e) => setCid(e.target.value.toUpperCase())}
                        placeholder="HIT-XXXXX"
                        className="bg-transparent outline-none w-full text-[15px] font-semibold tracking-wider text-goldsoft"
                        maxLength={9}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-silver/80">Пароль</label>
                    <div className="mt-1.5 flex items-center gap-2 input-imperial rounded-xl px-3.5 h-12">
                      <ILock size={17} className="text-mut shrink-0" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent outline-none w-full text-[15px]"
                      />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-mut hover:text-gold transition-colors">
                        <IEye size={17} />
                      </button>
                    </div>
                  </div>
                  {err && <div className="text-[13px] text-ember flex items-center gap-2">⚠ {err}</div>}
                  <button type="submit" className="btn-gold w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2">
                    Войти через Гиперион-ID <IArrowR size={17} />
                  </button>
                </form>
                <button onClick={() => { setPhase("recover"); setErr(""); }} className="mt-4 text-[13px] text-silver/70 hover:text-gold transition-colors">
                  Забыли пароль? Восстановление через email
                </button>
                <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.06] px-4 py-3 text-[12px] leading-relaxed text-goldsoft/90">
                  <b>Демо-доступ:</b> ID <span className="font-mono text-gold">HIT-77777</span> • пароль{" "}
                  <span className="font-mono text-gold">aureum</span>. Код 2FA придёт в push-уведомлении.
                </div>
              </>
            )}

            {phase === "2fa" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/30 grid place-items-center text-gold"><IShield size={22} /></div>
                  <div>
                    <h2 className="font-display font-bold text-2xl leading-tight">Двухфакторная аутентификация</h2>
                    <div className="text-[12px] text-mut">Код отправлен на ваше устройство • {cid}</div>
                  </div>
                </div>
                <p className="text-sm text-mut mt-4">Введите 6 цифр из push-уведомления Империи:</p>
                <div className="mt-5 flex gap-2" onPaste={onPaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { refs.current[i] = el; }}
                      value={d}
                      onChange={(e) => onDigit(i, e.target.value)}
                      onKeyDown={(e) => onKey(i, e)}
                      inputMode="numeric"
                      className="w-full h-14 text-center text-2xl font-bold text-gold input-imperial rounded-xl"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {err && <div className="mt-3 text-[13px] text-ember">⚠ {err}</div>}
                <div className="mt-5 flex gap-3">
                  <button onClick={() => setPhase("creds")} className="btn-ghost h-11 px-4 rounded-xl text-sm">← Назад</button>
                  <button
                    onClick={() => {
                      const c = genCode();
                      setCode(c);
                      setDigits(["", "", "", "", "", ""]);
                      a.toast("push", "🔐 Гиперион-ID • Push-уведомление", `Новый код подтверждения: ${c}`);
                    }}
                    className="h-11 px-4 rounded-xl text-sm text-goldsoft hover:bg-gold/10 border border-gold/25 transition-colors"
                  >
                    Отправить код повторно
                  </button>
                </div>
                <div className="mt-4 text-[12px] text-mut">Не видите уведомление? Код в демо-режиме дублируется во всплывающем оповещении.</div>
              </>
            )}

            {phase === "recover" && (
              <>
                <h2 className="font-display font-bold text-3xl">Восстановление пароля</h2>
                <p className="text-sm text-mut mt-1.5">Почта Империи отправит ссылку для сброса пароля.</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-silver/80">ID гражданина</label>
                    <input value={cid} onChange={(e) => setCid(e.target.value.toUpperCase())} placeholder="HIT-XXXXX" maxLength={9}
                      className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[15px] font-semibold tracking-wider text-goldsoft" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-widest text-silver/80">Email, привязанный к ID</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hyperion.gov" type="email"
                      className="mt-1.5 w-full h-12 input-imperial rounded-xl px-4 text-[15px]" />
                  </div>
                  {err && <div className="text-[13px] text-ember">⚠ {err}</div>}
                  <button onClick={recover} className="btn-gold w-full h-12 rounded-xl font-bold text-[15px]">Отправить ссылку</button>
                  <button onClick={() => { setPhase("creds"); setErr(""); }} className="w-full text-[13px] text-silver/70 hover:text-gold transition-colors">← Вернуться ко входу</button>
                </div>
              </>
            )}

            {phase === "recoverDone" && (
              <div className="text-center py-6 anim-pop">
                <div className="text-5xl">📮</div>
                <h2 className="font-display font-bold text-2xl mt-4">Письмо отправлено</h2>
                <p className="text-sm text-mut mt-2 leading-relaxed">
                  Ссылка для восстановления пароля доставлена на <span className="text-goldsoft">{email}</span>.
                  Ссылка действует 30 минут — такова воля Казначейства безопасности.
                </p>
                <button onClick={() => setPhase("creds")} className="btn-gold w-full h-12 rounded-xl font-bold text-[15px] mt-6">
                  Вернуться ко входу
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-[11px] text-mut">
              <span className="flex items-center gap-1.5"><Laurel className="w-8 text-gold/60" /></span>
              <span>E2E-шифрование активно • v3.7 «Аврора»</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IUserMini() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="text-mut shrink-0">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1.3-3.5 4.1-5 7.5-5s6.2 1.5 7.5 5" />
    </svg>
  );
}
