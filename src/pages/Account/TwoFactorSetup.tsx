import { useState } from "react";
import { ShieldCheck, Smartphone, CheckCircle, KeyRound, ShieldOff, AlertTriangle } from "lucide-react";
import { twoFactor } from "../../services/twoFactor";

export default function TwoFactorSetup() {
  const [step, setStep] = useState<"start" | "scan" | "done" | "disable-confirm" | "disabled">("start");
  const [data, setData] = useState<{ secret: string; otpauth_url: string; qr_data_url?: string } | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setErr(""); setBusy(true);
    try { const r = await twoFactor.setup(); setData(r); setStep("scan"); }
    catch (e: any) { setErr(e?.response?.data?.detail || "No se pudo iniciar la configuración"); }
    finally { setBusy(false); }
  }

  async function confirm() {
    setErr(""); setBusy(true);
    try { await twoFactor.confirm(code); setStep("done"); }
    catch (e: any) { setErr(e?.response?.data?.detail || "Código inválido. Verificá tu app e intentá de nuevo."); }
    finally { setBusy(false); }
  }

  async function disable() {
    setErr(""); setBusy(true);
    try { await twoFactor.disable(disableCode); setStep("disabled"); }
    catch (e: any) { setErr(e?.response?.data?.detail || "No se pudo deshabilitar el 2FA"); }
    finally { setBusy(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-lg mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand-600" /> Autenticación en dos pasos
        </h1>
        <p className="text-sm text-ink-500">Añadí una capa extra de seguridad a tu cuenta</p>
      </header>

      {step === "start" && (
        <div className="card space-y-5">
          <div className="flex gap-4 p-4 bg-brand-50 rounded-xl border border-brand-200">
            <Smartphone className="w-8 h-8 text-brand-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-bold text-brand-900">¿Cómo funciona?</div>
              <p className="text-sm text-brand-700 mt-1">
                Al activar el 2FA, necesitarás un código de 6 dígitos generado por tu app autenticadora cada vez que iniciés sesión.
                Compatible con <strong>Google Authenticator</strong>, <strong>Authy</strong>, <strong>1Password</strong> y similares.
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-ink-600">
            {["Instalá una app TOTP en tu celular", "Escaneá el código QR que aparecerá", "Ingresá el código de 6 dígitos para verificar"].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs grid place-items-center font-bold flex-shrink-0">{i + 1}</span> {t}
              </div>
            ))}
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <button className="btn-primary w-full" onClick={start} disabled={busy}>
            {busy ? "Generando…" : "Comenzar configuración"}
          </button>
          <div className="border-t border-ink-100 pt-4">
            <p className="text-sm text-ink-500 mb-3">Si ya tenés el 2FA activo y querés deshabilitarlo:</p>
            <button className="btn-danger w-full" onClick={() => { setErr(""); setDisableCode(""); setStep("disable-confirm"); }}>
              <ShieldOff className="w-4 h-4" /> Deshabilitar 2FA
            </button>
          </div>
        </div>
      )}

      {step === "scan" && data && (
        <div className="card space-y-5">
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-4 py-3 text-sm border border-amber-200">
            <KeyRound className="w-4 h-4 flex-shrink-0" />
            Guardá la clave secreta en un lugar seguro por si perdés acceso a tu app.
          </div>
          {data.qr_data_url && (
            <div className="flex flex-col items-center gap-3">
              <img src={data.qr_data_url} alt="QR 2FA" className="rounded-2xl border-4 border-white shadow-lg w-48 h-48" />
              <p className="text-xs text-ink-500 text-center">Escaneá este código con tu app autenticadora</p>
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1">Clave secreta manual</div>
            <div className="font-mono text-xs bg-ink-100 rounded-xl px-4 py-3 break-all select-all text-ink-800">{data.secret}</div>
          </div>
          <div>
            <label className="label">Código de verificación (6 dígitos)</label>
            <input className="input text-center text-2xl font-mono tracking-widest" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <button className="btn-primary w-full" onClick={confirm} disabled={code.length !== 6 || busy}>
            {busy ? "Verificando…" : "Confirmar y activar"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="card text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-800">¡2FA activada correctamente!</div>
            <p className="text-sm text-ink-500 mt-2">A partir de ahora necesitarás tu app autenticadora para iniciar sesión.</p>
          </div>
          <div className="text-xs text-ink-400 bg-ink-50 rounded-xl px-4 py-3">Si perdés acceso a tu app, contactá al administrador del sistema para recuperar tu cuenta.</div>
          <button className="btn-secondary" onClick={() => { setStep("start"); setCode(""); setData(null); }}>Volver</button>
        </div>
      )}

      {step === "disable-confirm" && (
        <div className="card space-y-5">
          <div className="flex gap-4 p-4 bg-rose-50 rounded-xl border border-rose-200">
            <AlertTriangle className="w-8 h-8 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-900">Deshabilitar autenticación en dos pasos</div>
              <p className="text-sm text-rose-700 mt-1">Para confirmar tu identidad, ingresá el código TOTP de tu app autenticadora.</p>
            </div>
          </div>
          <div>
            <label className="label">Código de tu app autenticadora (6 dígitos)</label>
            <input className="input text-center text-2xl font-mono tracking-widest" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
              autoFocus value={disableCode} onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setStep("start")}>Cancelar</button>
            <button className="btn-danger flex-1" onClick={disable} disabled={disableCode.length !== 6 || busy}>
              {busy ? "Deshabilitando…" : <><ShieldOff className="w-4 h-4" /> Sí, deshabilitar</>}
            </button>
          </div>
        </div>
      )}

      {step === "disabled" && (
        <div className="card text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 grid place-items-center mx-auto">
            <ShieldOff className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-800">2FA deshabilitado</div>
            <p className="text-sm text-ink-500 mt-2">Tu cuenta ya no requiere código TOTP. Podés volver a activarlo cuando quieras.</p>
          </div>
          <button className="btn-primary" onClick={() => { setStep("start"); setCode(""); setData(null); }}>Configurar 2FA nuevamente</button>
        </div>
      )}
    </div>
  );
}
