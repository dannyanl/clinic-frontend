import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, CalendarOff, CalendarDays, Copy, CheckCircle } from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import {
  getDoctor, listSchedules, createSchedule, deleteSchedule,
  listAbsences, createAbsence,
} from "../../services/doctors";
import { getDoctorSubscribeUrl } from "../../services/calendar";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";

export default function DoctorProfile() {
  const { t } = useI18n();
  const DAYS = [
    t("doctors.days.0"), t("doctors.days.1"), t("doctors.days.2"),
    t("doctors.days.3"), t("doctors.days.4"), t("doctors.days.5"), t("doctors.days.6"),
  ];

  const { id } = useParams();
  const doctorId = Number(id);
  const me = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: doctor, isLoading } = useQuery({ queryKey: ["doctor", doctorId], queryFn: () => getDoctor(doctorId) });
  const { data: schedules = [] } = useQuery({ queryKey: ["schedules", doctorId], queryFn: () => listSchedules(doctorId) });
  const { data: absences = [] } = useQuery({ queryKey: ["absences", doctorId], queryFn: () => listAbsences(doctorId) });

  const [schedModal, setSchedModal] = useState(false);
  const [absModal, setAbsModal] = useState(false);
  const [icalModal, setIcalModal] = useState(false);
  const [icalUrl, setIcalUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [sched, setSched] = useState({ weekday: 0, start_time: "09:00", end_time: "17:00", slot_minutes: 30 });
  const [abs, setAbs] = useState({ date: "", reason: "" });
  const [err, setErr] = useState<string | null>(null);

  const isOwner = me?.role === "doctor" && doctor?.user_id === me?.id;
  const canManage = me?.role === "admin" || isOwner;

  const addSched = useMutation({
    mutationFn: () => createSchedule(doctorId, { ...sched }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedules", doctorId] }); setSchedModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });
  const delSched = useMutation({
    mutationFn: (sid: number) => deleteSchedule(doctorId, sid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules", doctorId] }),
  });
  const addAbs = useMutation({
    mutationFn: () => createAbsence(doctorId, abs),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["absences", doctorId] }); setAbsModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  async function openIcal() {
    try {
      const { url } = await getDoctorSubscribeUrl(doctorId);
      setIcalUrl(url);
      setIcalModal(true);
    } catch { alert(t("common.error")); }
  }

  function copyUrl() {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) return <div className="p-10"><Spinner /></div>;
  if (!doctor) return <div className="p-10">{t("doctors.notFound")}</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <Link to="/doctors" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> {t("doctors.back")}
      </Link>

      <div className="card flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-20 h-20 rounded-2xl bg-brand-gradient grid place-items-center text-white font-bold text-3xl shadow-md flex-shrink-0">
          {doctor.full_name.slice(0, 1)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{doctor.full_name}</h1>
          <div className="text-brand-600 font-semibold">{doctor.specialty.name}</div>
          <div className="text-sm text-ink-500 mt-1">{t("doctors.license")}: {doctor.license_number}</div>
          {doctor.bio && <p className="text-sm text-ink-600 mt-3 leading-relaxed">{doctor.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="badge-blue">$ {Number(doctor.consultation_fee).toFixed(2)} {t("doctors.fee")}</span>
            {doctor.email && <span className="text-ink-500">{doctor.email}</span>}
            {doctor.phone && <span className="text-ink-500">{doctor.phone}</span>}
          </div>
        </div>
        <button onClick={openIcal} className="btn-secondary btn-sm flex-shrink-0" title={t("doctors.subscribeIcal")}>
          <CalendarDays className="w-4 h-4" /> {t("doctors.subscribeIcal")}
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("doctors.schedules")}</h2>
          {canManage && (
            <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setSchedModal(true); }}>
              <Plus className="w-3.5 h-3.5" /> {t("doctors.addSchedule")}
            </button>
          )}
        </div>
        {schedules.length === 0 ? (
          <div className="text-sm text-ink-500">{t("doctors.noSchedules")}</div>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-50 border border-ink-200">
                <div className="flex items-center gap-4">
                  <span className="font-semibold w-24">{DAYS[s.weekday]}</span>
                  <span className="text-ink-600">{s.start_time} — {s.end_time}</span>
                  <span className="badge-slate">{t("doctors.slotEvery")} {s.slot_minutes} {t("doctors.min")}</span>
                </div>
                {canManage && (
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => delSched.mutate(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("doctors.absences")}</h2>
          {canManage && (
            <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setAbsModal(true); }}>
              <Plus className="w-3.5 h-3.5" /> {t("doctors.addAbsence")}
            </button>
          )}
        </div>
        {absences.length === 0 ? (
          <div className="text-sm text-ink-500">{t("doctors.noAbsences")}</div>
        ) : (
          <div className="space-y-2">
            {absences.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <CalendarOff className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">{a.date}</span>
                {a.reason && <span className="text-ink-600 text-sm">{a.reason}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={icalModal} onClose={() => setIcalModal(false)} title={t("doctors.icalModal.title")} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-200 text-sm text-brand-700">
            <CalendarDays className="w-5 h-5 flex-shrink-0" />
            {t("doctors.icalModal.info")}
          </div>
          <div>
            <label className="label">{t("doctors.icalModal.urlLabel")}</label>
            <div className="flex gap-2">
              <input className="input flex-1 font-mono text-xs" value={icalUrl} readOnly />
              <button className="btn-secondary btn-sm px-3" onClick={copyUrl}>
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-400">{t("doctors.icalModal.hint")}</p>
        </div>
      </Modal>

      <Modal open={schedModal} onClose={() => setSchedModal(false)} title={t("doctors.schedModal.title")} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{t("doctors.schedModal.dayLabel")}</label>
            <select className="select" value={sched.weekday} onChange={(e) => setSched({ ...sched, weekday: Number(e.target.value) })}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t("doctors.schedModal.from")}</label>
              <input className="input" type="time" value={sched.start_time} onChange={(e) => setSched({ ...sched, start_time: e.target.value })} />
            </div>
            <div>
              <label className="label">{t("doctors.schedModal.to")}</label>
              <input className="input" type="time" value={sched.end_time} onChange={(e) => setSched({ ...sched, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">{t("doctors.schedModal.duration")}</label>
            <select className="select" value={sched.slot_minutes} onChange={(e) => setSched({ ...sched, slot_minutes: Number(e.target.value) })}>
              {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} {t("doctors.min")}</option>)}
            </select>
          </div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setSchedModal(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={() => addSched.mutate()} disabled={addSched.isPending}>{t("common.save")}</button>
          </div>
        </div>
      </Modal>

      <Modal open={absModal} onClose={() => setAbsModal(false)} title={t("doctors.absModal.title")} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{t("doctors.absModal.dateLabel")}</label>
            <input className="input" type="date" value={abs.date} onChange={(e) => setAbs({ ...abs, date: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("doctors.absModal.reasonLabel")}</label>
            <input className="input" value={abs.reason} onChange={(e) => setAbs({ ...abs, reason: e.target.value })} placeholder={t("doctors.absModal.reasonPh")} />
          </div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setAbsModal(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={() => addAbs.mutate()} disabled={!abs.date || addAbs.isPending}>{t("common.save")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
