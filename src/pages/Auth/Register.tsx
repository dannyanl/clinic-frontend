import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Lock, User, Phone, Calendar, CreditCard, Stethoscope,
  Building2, ArrowRight, Check, ChevronLeft, ChevronRight, AlertCircle,
  Heart, ShieldCheck
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type Path = "patient" | "clinic";
type Step = 1 | 2 | 3;

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const { signUp } = useAuth();
  const [path, setPath] = useState<Path | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patient form
  const [p, setP] = useState({
    full_name: "", email: "", password: "", confirm: "",
    phone: "", dni: "", birth_date: "",
    blood_type: "", allergies: "",
    emergency_contact: "", emergency_phone: "",
    health_insurance: "",
  });

  // Clinic/admin form
  const [c, setC] = useState({
    full_name: "", email: "", password: "", confirm: "",
    phone: "", clinic_name: "",
  });

  const pwMismatch = path === "patient"
    ? p.password !== p.confirm && p.confirm.length > 0
    : c.password !== c.confirm && c.confirm.length > 0;

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      if (path === "patient") {
        await signUp({
          full_name: p.full_name,
          email: p.email,
          password: p.password,
          phone: p.phone || undefined,
          dni: p.dni || undefined,
          birth_date: p.birth_date || undefined,
          role: "patient",
        });
      } else {
        await signUp({
          full_name: c.full_name,
          email: c.email,
          password: c.password,
          phone: c.phone || undefined,
          role: "admin",
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "No se pudo crear la cuenta. Verificá los datos e intentá de nuevo.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  // ── Path selector ──────────────────────────────────────────────────────────
  if (!path) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient grid place-items-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="font-display text-3xl font-extrabold">Clinix</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">¿Cómo querés usar Clinix?</h1>
            <p className="text-ink-500 mt-2">Elegí tu perfil para personalizar la experiencia</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <button
              onClick={() => setPath("patient")}
              className="group card text-left border-2 border-transparent hover:border-brand-400 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-gradient grid place-items-center shadow-md mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-extrabold mb-2">Soy paciente</h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                Quiero sacar turnos, ver mi historia clínica, recibir recordatorios y manejar mis datos de salud.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-600">
                {["Reserva de turnos online 24/7", "Historia clínica digital", "Resultados y recetas", "Recordatorios por WhatsApp"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 text-brand-600 font-bold text-sm group-hover:gap-3 transition-all">
                Registrarme como paciente <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => setPath("clinic")}
              className="group card text-left border-2 border-transparent hover:border-accent-400 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-gradient grid place-items-center shadow-md mb-4">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-extrabold mb-2">Soy clínica / médico</h2>
              <p className="text-sm text-ink-500 leading-relaxed">
                Quiero gestionar mi clínica, doctores, agenda, pagos, historia clínica y mucho más.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-600">
                {["Gestión de agenda y doctores", "Historia clínica electrónica", "Cobros y reportes", "Recordatorios automáticos"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent-600 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 text-accent-600 font-bold text-sm group-hover:gap-3 transition-all">
                Crear mi clínica <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-ink-500 mt-6">
            ¿Ya tenés cuenta? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Patient multi-step form ────────────────────────────────────────────────
  if (path === "patient") {
    const canNext1 = p.full_name.trim().length > 1 && p.email.includes("@") && p.password.length >= 8 && p.password === p.confirm;
    const canNext2 = true; // optional step
    const canSubmit = canNext1;

    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50">
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <button onClick={() => setPath(null)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-6">
              <ChevronLeft className="w-4 h-4" /> Volver a elegir perfil
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold">Registro de paciente</div>
                <div className="text-xs text-ink-500">Paso {step} de 3</div>
              </div>
              <div className="ml-auto flex gap-1.5">
                {[1,2,3].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? "bg-brand-500 w-8" : "bg-ink-200 w-4"}`} />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-extrabold">Datos de acceso</h2>
                <p className="text-sm text-ink-500">Con estos datos podrás iniciar sesión.</p>
                <div>
                  <label className="label">Nombre completo *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" required value={p.full_name}
                      onChange={e => setP({...p, full_name: e.target.value})} placeholder="María González" />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" type="email" required value={p.email}
                      onChange={e => setP({...p, email: e.target.value})} placeholder="maria@email.com" />
                  </div>
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" value={p.phone}
                      onChange={e => setP({...p, phone: e.target.value})} placeholder="+54 11 5555-1234" />
                  </div>
                </div>
                <div>
                  <label className="label">Contraseña *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" type="password" required minLength={8} value={p.password}
                      onChange={e => setP({...p, password: e.target.value})} placeholder="Mínimo 8 caracteres" />
                  </div>
                  {p.password && p.password.length < 8 && <p className="text-xs text-amber-600 mt-1">Mínimo 8 caracteres</p>}
                </div>
                <div>
                  <label className="label">Confirmar contraseña *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" type="password" required value={p.confirm}
                      onChange={e => setP({...p, confirm: e.target.value})} placeholder="Repetir contraseña" />
                  </div>
                  {pwMismatch && <p className="text-xs text-rose-600 mt-1">Las contraseñas no coinciden</p>}
                </div>
                {error && <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                </div>}
                <button className="btn-gradient w-full" disabled={!canNext1} onClick={() => setStep(2)}>
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-extrabold">Datos personales</h2>
                <p className="text-sm text-ink-500">Opcional pero recomendado. Ayuda a los médicos a atenderte mejor.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> DNI / Documento</label>
                    <input className="input" value={p.dni} onChange={e => setP({...p, dni: e.target.value})} placeholder="12.345.678" />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha de nacimiento</label>
                    <input className="input" type="date" value={p.birth_date} onChange={e => setP({...p, birth_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Grupo sanguíneo</label>
                    <select className="select" value={p.blood_type} onChange={e => setP({...p, blood_type: e.target.value})}>
                      <option value="">No sé / Omitir</option>
                      {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Obra social / Seguro</label>
                    <input className="input" value={p.health_insurance} onChange={e => setP({...p, health_insurance: e.target.value})} placeholder="OSDE, Swiss Medical…" />
                  </div>
                </div>
                <div>
                  <label className="label">Alergias conocidas</label>
                  <input className="input" value={p.allergies} onChange={e => setP({...p, allergies: e.target.value})} placeholder="Penicilina, látex, mariscos…" />
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary flex-1" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" /> Atrás</button>
                  <button className="btn-primary flex-1" onClick={() => setStep(3)}>Continuar <ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-extrabold">Contacto de emergencia</h2>
                <p className="text-sm text-ink-500">Opcional. Para situaciones de urgencia médica.</p>
                <div>
                  <label className="label">Nombre del contacto</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" value={p.emergency_contact} onChange={e => setP({...p, emergency_contact: e.target.value})} placeholder="Juan González (padre)" />
                  </div>
                </div>
                <div>
                  <label className="label">Teléfono de emergencia</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input className="input pl-10" value={p.emergency_phone} onChange={e => setP({...p, emergency_phone: e.target.value})} placeholder="+54 11 5555-9876" />
                  </div>
                </div>
                <div className="bg-ink-50 rounded-xl p-4 text-sm text-ink-600 border border-ink-200">
                  <div className="font-semibold mb-2 text-ink-800">Resumen de tu cuenta:</div>
                  <div className="space-y-1">
                    <div>👤 {p.full_name}</div>
                    <div>📧 {p.email}</div>
                    {p.phone && <div>📞 {p.phone}</div>}
                    {p.dni && <div>🪪 DNI {p.dni}</div>}
                    {p.birth_date && <div>🎂 {new Date(p.birth_date + "T00:00:00").toLocaleDateString()}</div>}
                    {p.blood_type && <div>🩸 {p.blood_type}</div>}
                  </div>
                </div>
                {error && <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                </div>}
                <p className="text-xs text-ink-400">
                  Al registrarte aceptás los <Link to="/legal/terms" className="text-brand-600">Términos</Link> y la{" "}
                  <Link to="/legal/privacy" className="text-brand-600">Política de Privacidad</Link>.
                </p>
                <div className="flex gap-2">
                  <button className="btn-secondary flex-1" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4" /> Atrás</button>
                  <button className="btn-gradient flex-1" onClick={submit} disabled={loading || !canSubmit}>
                    {loading ? "Creando cuenta…" : <><span>Crear mi cuenta</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            <p className="mt-6 text-sm text-ink-500 text-center">
              ¿Ya tenés cuenta? <Link to="/login" className="text-brand-600 font-semibold">Iniciar sesión</Link>
            </p>
          </div>
        </div>

        <div className="relative hidden lg:block bg-brand-gradient overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <Heart className="w-12 h-12 mb-6 text-white/60" />
            <h2 className="text-3xl font-display font-extrabold leading-tight mb-4">Tu salud, siempre a mano.</h2>
            <p className="text-white/80 max-w-sm leading-relaxed">
              Gestioná tus turnos, accedé a tu historia clínica y mantené tus datos de salud seguros desde cualquier dispositivo.
            </p>
            <div className="mt-8 space-y-3">
              {["Turnos online en segundos", "Historia clínica digital", "Recetas y resultados", "Recordatorios por WhatsApp"].map(f => (
                <div key={f} className="flex items-center gap-2 text-white/80 text-sm">
                  <Check className="w-4 h-4 text-white/60 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-2 text-xs text-white/50">
              <ShieldCheck className="w-4 h-4" /> Datos cifrados · HIPAA compatible · ISO 27001
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Clinic/admin form ─────────────────────────────────────────────────────
  const canClinicSubmit = c.full_name.trim().length > 1 && c.email.includes("@") && c.password.length >= 8 && c.password === c.confirm;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button onClick={() => setPath(null)} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mb-6">
            <ChevronLeft className="w-4 h-4" /> Volver a elegir perfil
          </button>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-accent-gradient grid place-items-center shadow">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="font-extrabold">Registro de clínica</div>
          </div>

          <h2 className="text-2xl font-extrabold mb-1">Creá tu cuenta de administrador</h2>
          <p className="text-sm text-ink-500 mb-6">Con este acceso gestionarás toda tu clínica.</p>

          <div className="space-y-4">
            <div>
              <label className="label">Tu nombre completo *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" required value={c.full_name}
                  onChange={e => setC({...c, full_name: e.target.value})} placeholder="Dr. Carlos Rodríguez" />
              </div>
            </div>
            <div>
              <label className="label">Nombre de la clínica</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" value={c.clinic_name}
                  onChange={e => setC({...c, clinic_name: e.target.value})} placeholder="Clínica San Martín" />
              </div>
            </div>
            <div>
              <label className="label">Email de la clínica *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" type="email" required value={c.email}
                  onChange={e => setC({...c, email: e.target.value})} placeholder="admin@clinica.com" />
              </div>
            </div>
            <div>
              <label className="label">Teléfono</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" value={c.phone}
                  onChange={e => setC({...c, phone: e.target.value})} placeholder="+54 11 5555-0000" />
              </div>
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" type="password" required minLength={8} value={c.password}
                  onChange={e => setC({...c, password: e.target.value})} placeholder="Mínimo 8 caracteres" />
              </div>
            </div>
            <div>
              <label className="label">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input className="input pl-10" type="password" required value={c.confirm}
                  onChange={e => setC({...c, confirm: e.target.value})} placeholder="Repetir contraseña" />
              </div>
              {pwMismatch && <p className="text-xs text-rose-600 mt-1">Las contraseñas no coinciden</p>}
            </div>
            {error && <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
            </div>}
            <p className="text-xs text-ink-400">
              Al continuar aceptás los <Link to="/legal/terms" className="text-brand-600">Términos</Link> y la{" "}
              <Link to="/legal/privacy" className="text-brand-600">Política de Privacidad</Link>.
            </p>
            <button className="btn-gradient w-full" disabled={loading || !canClinicSubmit} onClick={submit}>
              {loading ? "Creando cuenta…" : <><span>Crear mi clínica</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

          <p className="mt-6 text-sm text-ink-500 text-center">
            ¿Ya tenés cuenta? <Link to="/login" className="text-brand-600 font-semibold">Iniciar sesión</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block bg-accent-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <Building2 className="w-12 h-12 mb-6 text-white/60" />
          <h2 className="text-3xl font-display font-extrabold leading-tight mb-4">
            Todo tu equipo médico, en una sola plataforma.
          </h2>
          <p className="text-white/80 max-w-sm leading-relaxed">
            Gestión de doctores, pacientes, turnos, cobros, historia clínica y reportes — todo integrado y en tiempo real.
          </p>
          <ul className="mt-8 space-y-3 text-white/90">
            {[
              "Agenda multi-doctor y multi-sede",
              "Historia clínica electrónica (HCE)",
              "Cobros con Stripe y MercadoPago",
              "Reportes y métricas en tiempo real",
              "Recordatorios automáticos",
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 grid place-items-center flex-shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
