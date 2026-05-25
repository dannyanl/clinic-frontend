import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../services/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwValid = pw.length >= 8 && pw === confirm;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
        <div className="card max-w-md w-full text-center py-10 space-y-4">
          <div className="text-rose-600 text-xl font-bold">Enlace inválido</div>
          <p className="text-sm text-ink-500">El enlace de recuperación es inválido o ya fue utilizado.</p>
          <Link to="/forgot-password" className="btn-primary inline-flex">Solicitar uno nuevo</Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwValid) return;
    setErr(null); setLoading(true);
    try {
      await api.post("/auth/password/reset", { token, new_password: pw });
      setOk(true);
      setTimeout(() => nav("/login"), 2000);
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? "El enlace expiró o es inválido");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-display text-2xl font-extrabold">Clinix</span>
          </Link>

          {ok ? (
            <div className="card text-center space-y-4 py-10 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-800">¡Contraseña actualizada!</div>
                <p className="text-sm text-ink-500 mt-2">Serás redirigido al inicio de sesión en instantes…</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">Nueva contraseña</h1>
              <p className="text-sm text-ink-500 mt-2">Elegí una contraseña segura de al menos 8 caracteres.</p>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-10"
                      type="password"
                      required
                      minLength={8}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                  {pw && pw.length < 8 && <p className="text-xs text-amber-600 mt-1">Mínimo 8 caracteres</p>}
                </div>
                <div>
                  <label className="label">Confirmar nueva contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-10"
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repetir contraseña"
                    />
                  </div>
                  {confirm && pw !== confirm && <p className="text-xs text-rose-600 mt-1">Las contraseñas no coinciden</p>}
                </div>
                {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{err}</div>}
                <button type="submit" className="btn-gradient w-full" disabled={loading || !pwValid}>
                  {loading ? "Guardando…" : <><span>Guardar nueva contraseña</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-ink-200 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Tu contraseña se almacena cifrada de forma segura.
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-brand-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <div className="text-4xl font-display font-extrabold mb-4">Seguridad primero</div>
          <p className="text-white/80 text-lg max-w-md">Elegí una contraseña fuerte y única para proteger los datos de tu clínica y tus pacientes.</p>
          <div className="mt-10 space-y-2 text-sm text-white/70">
            {["Mínimo 8 caracteres", "Combiná letras, números y símbolos", "No uses contraseñas anteriores"].map((t) => (
              <div key={t} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-white/50" />{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
