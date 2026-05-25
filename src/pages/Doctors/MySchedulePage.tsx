import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Trash2, CalendarOff, Clock, DollarSign, Edit3, CheckCircle, Video } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import {
  listSchedules, createSchedule, deleteSchedule,
  listAbsences, createAbsence, updateDoctor, getDoctor,
} from "../../services/doctors";
import { useAuthStore } from "../../store/authStore";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

export default function MySchedulePage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [schedModal, setSchedModal] = useState(false);
  const [absModal, setAbsModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [sched, setSched] = useState({ weekday: 0, start_time: "09:00", end_time: "17:00", slot_minutes: 30 });
  const [abs, setAbs] = useState({ date: "", reason: "" });
  const [profile, setProfile] = useState({ bio: "", consultation_fee: "", accepts_telemedicine: false });

  // Fetch doctor profile linked to current user
  const doctorsQuery = useQuery({
    queryKey: ["my-doctor-profile"],
    queryFn: async () => {
      const { listDoctors } = await import("../../services/doctors");
      const all = await listDoctors();
      return all.find(d => d.user_id === user?.id) ?? null;
    },
    enabled: !!user?.id,
  });

  const doctor = doctorsQuery.data;
  const doctorId = doctor?.id;

  const schedules = useQuery({
    queryKey: ["schedules", doctorId],
    queryFn: () => listSchedules(doctorId!),
    enabled: !!doctorId,
  });

  const absences = useQuery({
    queryKey: ["absences", doctorId],
    queryFn: () => listAbsences(doctorId!),
    enabled: !!doctorId,
  });

  const addSched = useMutation({
    mutationFn: () => createSchedule(doctorId!, sched),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedules", doctorId] }); setSchedModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al agregar horario"),
  });

  const delSched = useMutation({
    mutationFn: (sid: number) => deleteSchedule(doctorId!, sid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules", doctorId] }),
  });

  const addAbs = useMutation({
    mutationFn: () => createAbsence(doctorId!, abs),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["absences", doctorId] }); setAbsModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al registrar ausencia"),
  });

  const updateProfile = useMutation({
    mutationFn: () => updateDoctor(doctorId!, {
      bio: profile.bio || undefined,
      consultation_fee: profile.consultation_fee ? Number(profile.consultation_fee) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-doctor-profile"] }); setEditModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al actualizar perfil"),
  });

  function openEditProfile() {
    if (doctor) {
      setProfile({
        bio: doctor.bio ?? "",
        consultation_fee: String(doctor.consultation_fee ?? ""),
        accepts_telemedicine: doctor.accepts_telemedicine ?? false,
      });
    }
    setErr(null);
    setEditModal(true);
  }

  // Build weekly summary
  const weekSummary = DAYS.map((day, i) => ({
    day, short: DAYS_SHORT[i],
    slots: (schedules.data ?? []).filter(s => s.weekday === i),
  }));

  if (doctorsQuery.isLoading) return <div className="p-10"><Spinner /></div>;

  if (!doctor) return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="card text-center py-12 space-y-4">
        <CalendarDays className="w-12 h-12 text-ink-300 mx-auto" />
        <div className="font-bold text-ink-600">No tenés un perfil de doctor asociado.</div>
        <p className="text-sm text-ink-400">Pedile a tu administrador que cree tu perfil profesional en el sistema.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Mi agenda</h1>
          <p className="text-sm text-ink-500">Gestioná tus horarios, ausencias y perfil profesional</p>
        </div>
        <button className="btn-secondary btn-sm" onClick={openEditProfile}>
          <Edit3 className="w-4 h-4" /> Editar mi perfil
        </button>
      </header>

      {/* Profile summary */}
      <div className="card flex flex-col md:flex-row gap-5 items-start">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient grid place-items-center text-white font-extrabold text-2xl shadow-lg flex-shrink-0">
          {doctor.full_name.slice(0, 1)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-extrabold text-xl">{doctor.full_name}</div>
          <div className="text-brand-600 font-semibold">{doctor.specialty.name}</div>
          <div className="text-sm text-ink-500">Mat. {doctor.license_number}</div>
          {doctor.bio && <p className="text-sm text-ink-600 mt-2 max-w-lg">{doctor.bio}</p>}
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <DollarSign className="w-3.5 h-3.5" /> $ {Number(doctor.consultation_fee).toFixed(2)} por consulta
            </span>
            {doctor.accepts_telemedicine && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                <Video className="w-3.5 h-3.5" /> Acepta telemedicina
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weekly schedule overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-600" /> Horarios de atención
          </h2>
          <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setSchedModal(true); }}>
            <Plus className="w-3.5 h-3.5" /> Agregar horario
          </button>
        </div>

        {schedules.isLoading ? <Spinner /> : (
          <>
            {/* Visual weekly grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekSummary.map(({ day, short, slots }) => (
                <div key={day} className={`rounded-xl p-2 text-center text-xs ${slots.length > 0 ? "bg-brand-50 border border-brand-200" : "bg-ink-50 border border-ink-200"}`}>
                  <div className={`font-bold mb-1 ${slots.length > 0 ? "text-brand-700" : "text-ink-400"}`}>{short}</div>
                  {slots.length > 0 ? (
                    <div className="space-y-0.5">
                      {slots.map(s => (
                        <div key={s.id} className="text-[10px] text-brand-600 font-medium leading-tight">{s.start_time}–{s.end_time}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-ink-300">Libre</div>
                  )}
                </div>
              ))}
            </div>

            {/* Detailed list */}
            {(schedules.data ?? []).length === 0 ? (
              <div className="text-sm text-ink-500 text-center py-4">Sin horarios configurados. Agregá tu primer horario de atención.</div>
            ) : (
              <div className="space-y-2">
                {(schedules.data ?? []).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-50 border border-ink-200">
                    <div className="flex items-center gap-4">
                      <span className="font-bold w-24 text-ink-800">{DAYS[s.weekday]}</span>
                      <div className="flex items-center gap-1.5 text-ink-600">
                        <Clock className="w-3.5 h-3.5 text-ink-400" />
                        {s.start_time} — {s.end_time}
                      </div>
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-lg font-semibold">
                        Turnos cada {s.slot_minutes} min
                      </span>
                      <span className="text-xs text-ink-400">
                        ~{Math.floor((Number(s.end_time.split(":")[0]) * 60 + Number(s.end_time.split(":")[1]) - (Number(s.start_time.split(":")[0]) * 60 + Number(s.start_time.split(":")[1]))) / s.slot_minutes)} turnos/día
                      </span>
                    </div>
                    <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => delSched.mutate(s.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Absences */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-amber-600" /> Ausencias y días no laborables
          </h2>
          <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setAbsModal(true); }}>
            <Plus className="w-3.5 h-3.5" /> Registrar ausencia
          </button>
        </div>
        {absences.isLoading ? <Spinner /> : (absences.data ?? []).length === 0 ? (
          <div className="text-sm text-ink-500 text-center py-4">Sin ausencias registradas. Los pacientes podrán sacar turnos en todos tus días hábiles.</div>
        ) : (
          <div className="space-y-2">
            {(absences.data ?? []).sort((a, b) => a.date.localeCompare(b.date)).map(a => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <CalendarOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-amber-900">{new Date(a.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                  {a.reason && <span className="text-amber-700 text-sm ml-2">· {a.reason}</span>}
                </div>
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${new Date(a.date) < new Date() ? "bg-ink-100 text-ink-400" : "bg-amber-100 text-amber-700"}`}>
                  {new Date(a.date) < new Date() ? "Pasado" : "Próximo"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal open={schedModal} onClose={() => setSchedModal(false)} title="Agregar horario de atención" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Día de la semana</label>
            <select className="select" value={sched.weekday} onChange={e => setSched({...sched, weekday: Number(e.target.value)})}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Inicio de atención</label>
              <input className="input" type="time" value={sched.start_time} onChange={e => setSched({...sched, start_time: e.target.value})} />
            </div>
            <div>
              <label className="label">Fin de atención</label>
              <input className="input" type="time" value={sched.end_time} onChange={e => setSched({...sched, end_time: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Duración de cada turno</label>
            <select className="select" value={sched.slot_minutes} onChange={e => setSched({...sched, slot_minutes: Number(e.target.value)})}>
              {[15, 20, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} minutos</option>)}
            </select>
            {sched.start_time && sched.end_time && (
              <p className="text-xs text-ink-400 mt-1">
                Aprox. {Math.floor((Number(sched.end_time.split(":")[0]) * 60 + Number(sched.end_time.split(":")[1]) - (Number(sched.start_time.split(":")[0]) * 60 + Number(sched.start_time.split(":")[1]))) / sched.slot_minutes)} turnos disponibles ese día
              </p>
            )}
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setSchedModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => addSched.mutate()} disabled={addSched.isPending}>
              <CheckCircle className="w-4 h-4" /> {addSched.isPending ? "Guardando…" : "Guardar horario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Absence Modal */}
      <Modal open={absModal} onClose={() => setAbsModal(false)} title="Registrar ausencia" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Fecha de ausencia</label>
            <input className="input" type="date" value={abs.date} onChange={e => setAbs({...abs, date: e.target.value})} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className="label">Motivo (opcional, visible para el equipo)</label>
            <input className="input" value={abs.reason} onChange={e => setAbs({...abs, reason: e.target.value})} placeholder="Vacaciones, feriado, congreso…" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            Los pacientes no podrán reservar turnos en esta fecha.
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setAbsModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => addAbs.mutate()} disabled={!abs.date || addAbs.isPending}>
              {addAbs.isPending ? "Guardando…" : "Registrar ausencia"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar mi perfil profesional" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Tarifa por consulta ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pl-9" type="number" min="0" step="0.01" value={profile.consultation_fee}
                onChange={e => setProfile({...profile, consultation_fee: e.target.value})} placeholder="2500.00" />
            </div>
          </div>
          <div>
            <label className="label">Biografía profesional</label>
            <textarea className="input" rows={4} value={profile.bio}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              placeholder="Especialista en cardiología con 15 años de experiencia…" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold">
            <div onClick={() => setProfile({...profile, accepts_telemedicine: !profile.accepts_telemedicine})}
              className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${profile.accepts_telemedicine ? "bg-brand-600" : "bg-ink-300"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${profile.accepts_telemedicine ? "left-6" : "left-1"}`} />
            </div>
            <Video className={`w-4 h-4 ${profile.accepts_telemedicine ? "text-brand-600" : "text-ink-400"}`} />
            Acepto consultas por telemedicina
          </label>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setEditModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
