import { useEffect, useRef, useState } from "react";
import { useImperium } from "../lib/store";
import { EDICTS } from "../lib/data";
import { ICrest, IShield, ILock, IEye, IRefresh, IBack, IBolt } from "../lib/icons";

const BG = "https://image.qwenlm.ai/generated-images/03df9204-34c1-447a-a983-cb0d5def3bdd/_result.png";

type Step = "login" | "2fa" | "recover" | "recover-done";

const formatHit = (raw: string) => {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 5);
  return digits ? `HIT-${digits}` : raw.replace(/[^a-zA-Z-]/g, "").toUpperCase().slice(0, 4);
};

export default function Login() {
  const { api } = useImperium();
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [hit, setHit] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [tick, setTick] = useState(0);
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const h = window.setInterval(() => setTick((x) => x + 1), 6000);
    return () => clearInterval(h);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const h = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(h);
  }, [cooldown]);

  const genCode = () => {
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setCode(c);
    api.toast("push", "Гиперион-ID • 2ФА", `Код подтверждения: ${c.slice(0, 3)} ${c.slice(3)}`, undefined, "🛡️");
    setCooldown(30);
  };

  const fail = (msg: string) => {
    setErr(msg);
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  const submitLogin = () => {
    setErr("");
    if (name.trim().length < 2) return fail("Укажите имя гражданина (минимум 2 символа)");
    if (!/^HIT-\d{5}$/.test(hit)) return fail("ID гражданина имеет формат HIT-XXXXX, например HIT-07770");
    if (pass.length < 4) return fail("Пароль слишком короток — минимум 4 символа");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDigits(["", "", "", "", "", ""]);
      setStep("2fa");
      genCode();
    }, 800);
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) boxRefs.current[i + 1]?.focus();
  };

  const onCodeKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxRefs.current[i - 1]?.focus();
    if (e.key === "Enter") verify();
  };

  const verify = () => {
    const entered = digits.join("");
    if (entered.length < 6) return fail("Введите все 6 цифр кода");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (entered === code) api.login(name.trim(), hit);
      else {
        fail("Код неверен. Стража рекомендует запросить новый");
        setDigits(["", "", "", "", "", ""]);
        boxRefs.current[0]?.focus();
      }
    }, 600);
  };

  const submitRecover = () => {
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Похоже, это не почтовый адрес Империи");
    setBusy(true);
    setTimeout(() => { setBusy(false); setStep("recover-done"); }, 900);
  };

  const fillDemo = () => { setName("Валериан Кест"); setHit("HIT-07770"); setPass("hyperion"); setErr(""); };

  return (
    <div className="h-full flex">
      {/* Имперская панель */}
      <div className="relative hidden lg:flex w-[46%] xl:w-[42%] flex-col justify-between overflow-hidden">
        <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a20] via-[#0a0a20]/38 to-[#0a0a20]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a20]" />
        <div className="relative z-10 flex items-center gap-4 p-10">
          <ICrest size={54} />
          <div>
            <div className="font-display text-3xl xl:text-4xl font-800 tracking-wide text-white" style={{ fontWeight: 800 }}>
              ИМПЕРИУМ <span className="gold-text">ЛИНК</span>
            </div>
            <div className="mt-1 text-[11px] tracking-[0.34em] text-silver uppercase">Связь Империи Гиперион</div>
          </div>
        </div>
        <div className="relative z-10 px-10 pb-10 max-w-xl">
          <div className="hairline-gold mb-6" />
          <div key={tick} className="anim-fade-up">
            <div className="text-[11px] tracking-[0.3em] text-gold/80 uppercase mb-2">Сводка Канцелярии</div>
            <p className="font-display text-xl xl:text-2xl leading-snug text-white/92 italic" style={{ fontWeight: 600 }}>
              {EDICTS[tick % EDICTS.length]}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["128 404", "граждан в сети"],
              ["4", "провинции"],
              ["47", "цикл Империи"],
            ].map(([v, l]) => (
              <div key={l} className="glass-soft rounded-lg px-4 py-3">
                <div className="font-display text-2xl text-gold" style={{ fontWeight: 700 }}>{v}</div>
                <div className="text-[11px] text-silver/80 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Терминал доступа */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <ICrest size={42} />
            <div className="font-display text-2xl text-white" style={{ fontWeight: 800 }}>
              ИМПЕРИУМ <span className="gold-text">ЛИНК</span>
            </div>
          </div>

          <div className={`glass gold-frame rounded-2xl p-7 sm:p-8 ${shake ? "anim-shake" : "anim-fade-up"}`}>
            {step === "login" && (
              <>
                <div className="flex items-center gap-2 text-gold/90 text-[11px] tracking-[0.28em] uppercase">
                  <ILock size={14} /> Терминал доступа • шифрование E2E
                </div>
                <h1 className="font-display text-3xl text-white mt-3" style={{ fontWeight: 800 }}>
                  Врата Империи
                </h1>
                <p className="text-silver/85 text-sm mt-1.5">Предъявите удостоверение гражданина</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-[11px] tracking-widest uppercase text-silver/70">Имя гражданина</label>
                    <input className="input-imp w-full mt-1.5 rounded-lg px-3.5 py-2.5 text-sm" placeholder="Например: Валериан Кест"
                      value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-widest uppercase text-silver/70">ID гражданина</label>
                    <input className="input-imp w-full mt-1.5 rounded-lg px-3.5 py-2.5 text-sm font-mono tracking-[0.18em]" placeholder="HIT-07770"
                      value={hit} onChange={(e) => setHit(formatHit(e.target.value))} onKeyDown={(e) => e.key === "Enter" && submitLogin()} />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-widest uppercase text-silver/70">Пароль</label>
                    <div className="relative">
                      <input className="input-imp w-full mt-1.5 rounded-lg px-3.5 py-2.5 pr-10 text-sm" placeholder="••••••••"
                        type={showPass ? "text" : "password"} value={pass}
                        onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitLogin()} />
                      <button className="absolute right-3 top-1/2 translate-y-1 text-silver/60 hover:text-gold transition-colors"
                        style={{ marginTop: 3 }} onClick={() => setShowPass((v) => !v)} aria-label="Показать пароль">
                        <IEye size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {err && <div className="mt-3 text-[13px] text-ember flex items-center gap-1.5">⚠ {err}</div>}

                <button className="btn-gold w-full mt-5 rounded-xl py-3 text-sm tracking-wide flex items-center justify-center gap-2"
                  onClick={submitLogin} disabled={busy}>
                  {busy ? <span className="typing-dot" /> : <IBolt size={16} />}
                  {busy ? "Проверка печати…" : "Войти в Империю"}
                </button>

                <div className="mt-4 flex items-center justify-between text-[13px]">
                  <button className="text-silver/75 hover:text-gold transition-colors" onClick={() => { setStep("recover"); setErr(""); }}>
                    Забыли доступ?
                  </button>
                  <button className="text-silver/75 hover:text-gold transition-colors" onClick={fillDemo}>
                    Демо-доступ ⚜
                  </button>
                </div>
              </>
            )}

            {step === "2fa" && (
              <>
                <div className="flex items-center gap-2 text-gold/90 text-[11px] tracking-[0.28em] uppercase">
                  <IShield size={14} /> Двухфакторная печать
                </div>
                <h1 className="font-display text-3xl text-white mt-3" style={{ fontWeight: 800 }}>Код Стражи</h1>
                <p className="text-silver/85 text-sm mt-1.5">
                  Шестизначный код отправлен на ваше имперское устройство ({hit})
                </p>
                <div className="flex gap-2.5 mt-6 justify-between">
                  {digits.map((d, i) => (
                    <input key={i} ref={(el) => { boxRefs.current[i] = el; }} value={d} inputMode="numeric"
                      onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onCodeKey(i, e)}
                      className="input-imp w-full aspect-[4/5] rounded-xl text-center font-display text-2xl text-gold focus:border-gold/70"
                      style={{ fontWeight: 700 }} />
                  ))}
                </div>
                {err && <div className="mt-3 text-[13px] text-ember">⚠ {err}</div>}
                <button className="btn-gold w-full mt-5 rounded-xl py-3 text-sm tracking-wide" onClick={verify} disabled={busy}>
                  {busy ? "Сверка с реестром…" : "Подтвердить и войти"}
                </button>
                <div className="mt-4 flex items-center justify-between text-[13px]">
                  <button className="text-silver/75 hover:text-gold transition-colors" onClick={() => { setStep("login"); setErr(""); }}>
                    ← Назад
                  </button>
                  <button className="flex items-center gap-1.5 text-silver/75 hover:text-gold transition-colors disabled:opacity-40"
                    onClick={genCode} disabled={cooldown > 0}>
                    <IRefresh size={14} /> {cooldown > 0 ? `Повторно через ${cooldown} с` : "Отправить код снова"}
                  </button>
                </div>
                <div className="mt-5 text-[12px] text-silver/60 leading-relaxed glass-soft rounded-lg px-3 py-2.5">
                  💡 Код пришёл имперским push-уведомлением (всплывёт справа сверху). В реальной Империи он приходит на Гиперион-ID.
                </div>
              </>
            )}

            {step === "recover" && (
              <>
                <div className="flex items-center gap-2 text-gold/90 text-[11px] tracking-[0.28em] uppercase">
                  <IRefresh size={14} /> Восстановление доступа
                </div>
                <h1 className="font-display text-3xl text-white mt-3" style={{ fontWeight: 800 }}>Печать Сената</h1>
                <p className="text-silver/85 text-sm mt-1.5">Укажите почту, зарегистрированную в реестре граждан, — Сенат направит письмо для восстановления</p>
                <input className="input-imp w-full mt-5 rounded-lg px-3.5 py-2.5 text-sm" placeholder="grażdанин@imperium.hy"
                  value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitRecover()} />
                {err && <div className="mt-3 text-[13px] text-ember">⚠ {err}</div>}
                <button className="btn-gold w-full mt-5 rounded-xl py-3 text-sm tracking-wide" onClick={submitRecover} disabled={busy}>
                  {busy ? "Гонец уже в пути…" : "Отправить письмо"}
                </button>
                <button className="mt-4 text-[13px] text-silver/75 hover:text-gold transition-colors flex items-center gap-1"
                  onClick={() => { setStep("login"); setErr(""); }}>
                  <IBack size={14} /> К Вратам Империи
                </button>
              </>
            )}

            {step === "recover-done" && (
              <div className="text-center py-4">
                <div className="text-5xl">🕊️</div>
                <h1 className="font-display text-2xl text-white mt-4" style={{ fontWeight: 800 }}>Письмо отправлено</h1>
                <p className="text-silver/85 text-sm mt-2 leading-relaxed">
                  Гонец Империи несёт письмо с печатью Сената на <span className="text-gold">{email}</span>. Следуйте указаниям внутри.
                </p>
                <button className="btn-ghost w-full mt-6 rounded-xl py-2.5 text-sm" onClick={() => { setStep("login"); setEmail(""); }}>
                  Вернуться ко Вратам
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 text-center text-[11px] text-silver/50 tracking-wide">
            Империя Гиперион • цикл 47 • соединение защищено квантовой печатью
          </div>
        </div>
      </div>
    </div>
  );
}
