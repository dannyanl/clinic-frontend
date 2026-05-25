import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { login as loginApi } from "../../services/auth";
import { useAuthStore } from "../../store/authStore";
import { useI18n, SUPPORTED_LANGS } from "../../i18n";

export default function Login() {
  const { signIn } = useAuth();
  const setTokens = useAuthStore((s) => s.setTokens);
  const { t, lang, setLang } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      const detail: string = err?.response?.data?.detail ?? "";
      if (detail.toLowerCase().includes("totp") || detail.toLowerCase().includes("two_factor") || detail.toLowerCase().includes("2fa")) {
        setStep("totp");
      } else {
        setError(detail || t("auth.invalid_credentials"));
      }
    } finally { setLoading(false); }
  }

  async function onSubmitTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const tokens = await loginApi(email, password, totp);
      setTokens(tokens);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? t("auth.invalid_code"));
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50">
      {/* Left: form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Language picker */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-1">
              {SUPPORTED_LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  title={code.toUpperCase()}
                  className={`text-lg px-1.5 py-0.5 rounded transition ${
                    lang === code ? "ring-2 ring-brand-500" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-display text-2xl font-extrabold">Clinix</span>
          </Link>

          {step === "credentials" ? (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">{t("auth.welcome_back")}</h1>
              <p className="text-sm text-ink-500 mt-2">{t("auth.signin_subtitle")}</p>
              <form onSubmit={onSubmitCredentials} className="mt-8 space-y-4">
                <div>
                  <label className="label">{t("auth.email")}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" type="email" required value={email}
                           onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="label">{t("auth.password")}</label>
                    <Link to="/forgot-password" className="text-xs text-brand-600 font-semibold mb-1.5">{t("auth.forgot")}</Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" type="password" required value={password}
                           onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </div>
                {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
                <button type="submit" className="btn-gradient w-full" disabled={loading}>
                  {loading ? t("auth.signing_in") : <><span>{t("auth.signin_btn")}</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <p className="mt-6 text-sm text-ink-500 text-center">
                {t("auth.no_account")} <Link to="/register" className="text-brand-600 font-semibold">{t("auth.trial_cta")}</Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent-100 grid place-items-center">
                  <KeyRound className="w-6 h-6 text-accent-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold">{t("auth.2fa_title")}</h1>
                  <p className="text-sm text-ink-500">{t("auth.2fa_subtitle")}</p>
                </div>
              </div>
              <form onSubmit={onSubmitTotp} className="space-y-5">
                <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl text-sm text-accent-800">
                  {t("auth.2fa_info")}
                </div>
                <div>
                  <label className="label">{t("auth.2fa_code_label")}</label>
                  <input
                    className="input text-center text-3xl font-mono tracking-widest"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                  />
                </div>
                {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
                <button type="submit" className="btn-gradient w-full" disabled={loading || totp.length !== 6}>
                  {loading ? t("auth.2fa_verifying") : <><span>{t("auth.2fa_verify_btn")}</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" className="w-full text-sm text-ink-500 hover:text-ink-700 text-center" onClick={() => { setStep("credentials"); setTotp(""); setError(null); }}>
                  {t("auth.2fa_back")}
                </button>
              </form>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-ink-200 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {t("auth.security_note")}
          </div>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden lg:block bg-brand-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <blockquote className="text-2xl font-display font-bold leading-snug max-w-md">
            "We moved from spreadsheets to Clinix in 2 weeks. Occupancy rose 22% and no-shows dropped in half."
          </blockquote>
          <div className="mt-6">
            <div className="font-bold">Dr. Laura Chen</div>
            <div className="text-white/80 text-sm">Medical Director · Healthspring Clinic</div>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[{ v: "+540", l: "Clinics" }, { v: "1.2M", l: "Appts / mo" }, { v: "99.95%", l: "Uptime" }].map((s) => (
              <div key={s.l}>
                <div className="text-3xl font-extrabold">{s.v}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
