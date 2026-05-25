import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, Video, RefreshCw } from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import { createAppointment, createAppointmentSeries, getSlots } from "../../services/appointments";
import { listDoctors, listSpecialties } from "../../services/doctors";
import { listPatients } from "../../services/patients";
import { useAuthStore } from "../../store/authStore";
import type { AppointmentType } from "../../types";

const APPT_TYPES: { value: AppointmentType; label: string; icon: string; desc: string; color: string }[] = [
  { value: "consulta", label: "Consulta", icon: "🩺", desc: "Atención médica general o especializada", color: "border-brand-300 bg-brand-50 text-brand-800" },
  { value: "cirugia", label: "Cirugía", icon: "🔪", desc: "Intervención quirúrgica programada", color: "border-rose-300 bg-rose-50 text-rose-800" },
  { value: "procedimiento", label: "Procedimiento", icon: "💉", desc: "Infiltración, endoscopia, etc.", color: "border-violet-300 bg-violet-50 text-violet-800" },
  { value: "seguimiento", label: "Control", icon: "📋", desc: "Seguimiento post-tratamiento", color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { value: "urgencia", label: "Urgencia", icon: "🚨", desc: "Atención urgente no programada", color: "border-amber-300 bg-amber-50 text-amber-800" },
  { value: "telemedicina", label: "Telemedicina", icon: "📹", desc: "Consulta por videollamada", color: "border-sky-300 bg-sky-50 text-sky-800" },
  { value: "estudio", label: "Estudio", icon: "🔬", desc: "Análisis, eco, radiografía, etc.", color: "border-slate-300 bg-slate-50 text-slate-800" },
];

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const canPickPatient = role === "admin" || role === "receptionist" || role === "doctor";

  const [specialtyId, setSpecialtyId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [day, setDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");
  const [patientId, setPatientId] = useState(params.get("patient") ?? "");
  const [apptType, setApptType] = useState<AppointmentType>("consulta");
  const [isTelemedicine, setIsTelemedicine] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [occurrences, setOccurrences] = useState(4);
  const [error, setError] = useState<string | null>(null);

  // auto-set telemedicine toggle when type is telemedicina
  function setType(t: AppointmentType) {
    setApptType(t);
    if (t === "telemedicina") setIsTelemedicine(true);
    else if (isTelemedicine && t !== "telemedicina") setIsTelemedicine(false);
  }

  const specialties = useQuery({ queryKey: ["specialties"], queryFn: listSpecialties });
  const doctors = useQuery({
    queryKey: ["doctors", specialtyId],
    queryFn: () => listDoctors(specialtyId ? { specialty_id: Number(specialtyId) } : undefined),
  });
  const patients = useQuery({
    queryKey: ["patients-all"],
    queryFn: () => listPatients(),
    enabled: canPickPatient,
  });
  const slots = useQuery({
    queryKey: ["slots", doctorId, day],
    queryFn: () => getSlots(Number(doctorId), day),
    enabled: !!doctorId && !!day,
  });

  const book = useMutation({
    mutationFn: (starts_at: string) => {
      const payload = {
        doctor_id: Number(doctorId),
        starts_at,
        reason: reason || undefined,
        patient_id: patientId ? Number(patientId) : undefined,
        appointment_type: apptType,
        is_telemedicine: isTelemedicine || apptType === "telemedicina" || undefined,
      };
      if (isRecurring) return createAppointmentSeries({ ...payload, recurrence, occurrences });
      return createAppointment(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      navigate("/appointments");
    },
    onError: (err: any) => setError(err?.response?.data?.detail ?? "No se pudo reservar el turno"),
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Reservar turno</h1>
        <p className="text-sm text-ink-500">Elegí el tipo de atención, especialidad, doctor y horario</p>
      </header>

      {/* Step 1: Appointment type */}
      <div className="card">
        <h2 className="font-bold text-ink-800 mb-3">¿Qué tipo de atención necesitás?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {APPT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all ${
                apptType === t.value
                  ? `${t.color} border-current shadow-sm`
                  : "bg-white border-ink-200 hover:border-ink-300 hover:bg-ink-50"
              }`}
            >
              <div className="text-2xl">{t.icon}</div>
              <div className={`font-bold text-sm ${apptType === t.value ? "" : "text-ink-800"}`}>{t.label}</div>
              <div className={`text-xs leading-snug ${apptType === t.value ? "opacity-80" : "text-ink-400"}`}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Doctor + date */}
      <div className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Especialidad</label>
            <select className="select" value={specialtyId} onChange={(e) => { setSpecialtyId(e.target.value); setDoctorId(""); }}>
              <option value="">Todas las especialidades</option>
              {(specialties.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Doctor *</label>
            <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Seleccionar doctor…</option>
              {(doctors.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.specialty.name}
                  {d.accepts_telemedicine ? " 📹" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Día del turno *</label>
            <input className="input" type="date" value={day} onChange={(e) => setDay(e.target.value)} min={format(new Date(), "yyyy-MM-dd")} />
          </div>
          <div>
            <label className="label">Motivo (opcional)</label>
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Dolor en la zona lumbar, control anual…" />
          </div>
          {canPickPatient && (
            <div className="sm:col-span-2">
              <label className="label">Paciente (dejá vacío para tu propia cuenta)</label>
              <select className="select" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">— Mi cuenta —</option>
                {(patients.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Telemedicine toggle */}
        {apptType !== "telemedicina" && (
          <div className="border-t border-ink-100 pt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsTelemedicine(!isTelemedicine)}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${isTelemedicine ? "bg-brand-600" : "bg-ink-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isTelemedicine ? "left-6" : "left-1"}`} />
              </div>
              <div className="flex items-center gap-2">
                <Video className={`w-4 h-4 ${isTelemedicine ? "text-brand-600" : "text-ink-400"}`} />
                <span className="text-sm font-semibold">Convertir a videollamada (telemedicina)</span>
              </div>
            </label>
            {isTelemedicine && (
              <div className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 rounded-xl px-4 py-2.5 border border-brand-200 mt-2">
                <Video className="w-4 h-4 flex-shrink-0" />
                Se generará un link de videollamada que ambas partes recibirán por email.
              </div>
            )}
          </div>
        )}

        {/* Recurring toggle (staff only) */}
        {canPickPatient && (
          <div className="border-t border-ink-100 pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${isRecurring ? "bg-accent-600" : "bg-ink-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isRecurring ? "left-6" : "left-1"}`} />
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isRecurring ? "text-accent-600" : "text-ink-400"}`} />
                <span className="text-sm font-semibold">Turno recurrente (crear serie de turnos)</span>
              </div>
            </label>
            {isRecurring && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-accent-50 border border-accent-200 rounded-xl">
                <div>
                  <label className="label">Frecuencia</label>
                  <select className="select" value={recurrence} onChange={(e) => setRecurrence(e.target.value as any)}>
                    <option value="weekly">Semanal (cada 7 días)</option>
                    <option value="biweekly">Quincenal (cada 14 días)</option>
                    <option value="monthly">Mensual (cada 30 días)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Cantidad de turnos en la serie</label>
                  <input className="input" type="number" min={2} max={52} value={occurrences} onChange={(e) => setOccurrences(Number(e.target.value))} />
                </div>
                <div className="sm:col-span-2 text-xs text-accent-700 bg-accent-100/60 rounded-lg px-3 py-2">
                  Se crearán <strong>{occurrences} turnos</strong> con frecuencia <strong>{recurrence === "weekly" ? "semanal" : recurrence === "biweekly" ? "quincenal" : "mensual"}</strong> a partir del horario que elijas.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Time slot picker */}
      <div className="card">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" /> Horarios disponibles para el {day ? new Date(day + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "día seleccionado"}
        </h2>
        {!doctorId && <p className="text-sm text-ink-500">Elegí un doctor para ver los horarios disponibles.</p>}
        {slots.isLoading && <Spinner />}
        {slots.data && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {slots.data.length === 0 && (
              <div className="col-span-8 text-sm text-ink-500 py-4 text-center">
                Sin horarios disponibles para ese día. Probá con otro día.
              </div>
            )}
            {slots.data.map((s) => (
              <button key={s.starts_at}
                disabled={!s.available || book.isPending}
                onClick={() => book.mutate(s.starts_at)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  s.available
                    ? "bg-white border-ink-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 hover:shadow-sm"
                    : "bg-ink-50 border-ink-100 text-ink-300 cursor-not-allowed line-through"
                }`}>
                {format(new Date(s.starts_at), "HH:mm")}
              </button>
            ))}
          </div>
        )}
        {book.isPending && (
          <div className="mt-3 flex items-center gap-2 text-sm text-brand-600 font-semibold">
            <Spinner />
            {isRecurring ? `Creando serie de ${occurrences} turnos…` : "Reservando turno…"}
          </div>
        )}
        {error && <div className="mt-3 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>}
      </div>
    </div>
  );
}
