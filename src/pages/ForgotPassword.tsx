import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await api.post("/auth/password/forgot", { email });
      setDone(true);
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail ?? "No se pudo enviar el email");
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

          {done ? (
            <div className="card text-center space-y-4 py-10 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-800">¡Email enviado!</div>
                <p className="text-sm text-ink-500 mt-2">
                  Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>
              </div>
              <p className="text-xs text-ink-400">Revisá también tu carpeta de spam.</p>
              <Link to="/login" className="btn-secondary inline-flex mx-auto">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">Recuperar contraseña</h1>
              <p className="text-sm text-ink-500 mt-2">
                Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
              </p>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <label className="label">Email registrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-10"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@clinica.com"
                    />
                  </div>
                </div>
                {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{err}</div>}
                <button type="submit" className="btn-gradient w-full" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-ink-200 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Los enlaces de recuperación expiran en 24 horas.
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block bg-brand-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <div className="text-4xl font-display font-extrabold mb-4">¿Olvidaste tu contraseña?</div>
          <p className="text-white/80 text-lg max-w-md">
            No te preocupes. Solo ingresá tu email y te enviaremos un enlace seguro para restablecerla en minutos.
          </p>
          <div className="mt-10 space-y-3">
            {["El enlace es de un solo uso", "Expira en 24 horas por seguridad", "Si no llegó, revisá spam"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-white/60" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
