import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");

  useEffect(() => {
    const t = params.get("token");
    if (!t) { setState("err"); return; }
    api.post("/auth/email/verify", { token: t })
      .then(() => setState("ok"))
      .catch(() => setState("err"));
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="card max-w-md w-full text-center py-12 space-y-5 animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-md">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="font-display text-2xl font-extrabold">Clinix</span>
        </Link>

        {state === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-100 grid place-items-center mx-auto">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
            <div>
              <div className="text-xl font-extrabold">Verificando email…</div>
              <p className="text-sm text-ink-500 mt-1">Por favor esperá un momento.</p>
            </div>
          </>
        )}

        {state === "ok" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-800">¡Email verificado!</div>
              <p className="text-sm text-ink-500 mt-2">Tu cuenta está confirmada. Ya podés iniciar sesión.</p>
            </div>
            <Link to="/login" className="btn-gradient inline-flex mx-auto">Ir al inicio de sesión</Link>
          </>
        )}

        {state === "err" && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 grid place-items-center mx-auto">
              <XCircle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-rose-800">Token inválido o expirado</div>
              <p className="text-sm text-ink-500 mt-2">El enlace de verificación no es válido o ya fue utilizado. Solicitá uno nuevo desde tu perfil.</p>
            </div>
            <Link to="/login" className="btn-secondary inline-flex mx-auto">Ir al inicio de sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
