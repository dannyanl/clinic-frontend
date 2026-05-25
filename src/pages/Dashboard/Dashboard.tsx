import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users, Stethoscope, CalendarClock, Clock, DollarSign, TrendingUp, Plus,
  CalendarDays, Video, FileText, AlertCircle,
} from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import AppointmentCalendar from "../../components/calendar/AppointmentCalendar";
import { listAppointments } from "../../services/appointments";
import { getDashboard, getDoctorDashboard } from "../../services/reports";
import { getMyPatient } from "../../services/patients";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";
import { APPOINTMENT_TYPE_ICON, APPOINTMENT_TYPE_LABEL } from "../../types";

function StatCard({ label, value, icon: Icon, tone, sub }: {
  label: string; value: string | number; icon: React.FC<any>; tone: string; sub?: string;
}) {
  return (
    <div className="card relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${tone} opacity-10 group-hover:opacity-20 transition`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} grid place-items-center shadow mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-ink-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{sub}</div>}
    </div>
  );
}

function useLocale() {
  const { lang } = useI18n();
  const localeMap: Record<string, string> = {
    es: "es-ES", en: "en-US", pt: "pt-BR", fr: "fr-FR",
  };
  return localeMap[lang] ?? "en-US";
}

// ── Admin / Receptionist dashboard ─────────────────────────────────────────
function AdminDashboard({ user }: { user: any }) {
  const { t } = useI18n();
  const locale = useLocale();
  const metrics = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const appts = useQuery({ queryKey: ["appointments", "calendar"], queryFn: () => listAppointments() });

  const firstName = user?.full_name?.split(" ")[0] ?? t("dashboard.welcome");

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("dashboard.greeting", { name: firstName })}
          </h1>
          <p className="text-ink-500">{t("dashboard.summary")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/appointments/new" className="btn-gradient">
            <Plus className="w-4 h-4" /> {t("dashboard.action.new_btn")}
          </Link>
          <Link to="/patients" className="btn-secondary">
            <Users className="w-4 h-4" /> {t("dashboard.action.patients_btn")}
          </Link>
        </div>
      </header>

      {metrics.isLoading ? <div className="flex justify-center py-8"><Spinner /></div> : metrics.data && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label={t("dashboard.stat.patients")} value={metrics.data.total_patients} icon={Users} tone="from-brand-500 to-brand-700" sub={t("dashboard.stat.realtime")} />
          <StatCard label={t("dashboard.stat.doctors")} value={metrics.data.total_doctors} icon={Stethoscope} tone="from-accent-500 to-accent-700" />
          <StatCard label={t("dashboard.stat.today")} value={metrics.data.appointments_today} icon={CalendarClock} tone="from-emerald-500 to-emerald-700" />
          <StatCard label={t("dashboard.stat.pending")} value={metrics.data.appointments_pending} icon={Clock} tone="from-amber-500 to-amber-700" />
          <StatCard label={t("dashboard.stat.revenue")} value={`${Number(metrics.data.revenue_month).toFixed(0)}`} icon={DollarSign} tone="from-rose-500 to-rose-700" />
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{t("dashboard.weekly_agenda")}</h2>
          <Link to="/appointments" className="text-sm text-brand-600 hover:underline font-semibold">{t("dashboard.view_all")}</Link>
        </div>
        <div className="card p-2 md:p-4">
          {appts.isLoading ? <Spinner /> : <AppointmentCalendar appointments={appts.data ?? []} />}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/appointments/new", icon: Plus, label: t("dashboard.action.new_appointment"), sub: t("dashboard.action.new_appointment_sub"), color: "text-brand-600 bg-brand-50" },
          { to: "/medical-records", icon: FileText, label: t("dashboard.action.records"), sub: t("dashboard.action.records_sub"), color: "text-accent-600 bg-accent-50" },
          { to: "/reports", icon: TrendingUp, label: t("dashboard.action.reports"), sub: t("dashboard.action.reports_sub"), color: "text-emerald-600 bg-emerald-50" },
        ].map(({ to, icon: Icon, label, sub, color }) => (
          <Link key={to} to={to} className="card hover:shadow-lg transition flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} grid place-items-center flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">{label}</div>
              <div className="text-xs text-ink-500">{sub}</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

// ── Doctor dashboard ────────────────────────────────────────────────────────
function DoctorDashboard({ user }: { user: any }) {
  const { t } = useI18n();
  const locale = useLocale();
  const metrics = useQuery({ queryKey: ["doctor-dashboard"], queryFn: getDoctorDashboard });
  const appts = useQuery({ queryKey: ["appointments", "doctor"], queryFn: () => listAppointments({ status: "confirmed" }) });

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = (appts.data ?? []).filter(a => a.starts_at.startsWith(today));
  const nextAppt = (appts.data ?? []).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).find(a => a.starts_at >= new Date().toISOString());

  const lastName = user?.full_name?.split(" ").pop() ?? "";

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("dashboard.greeting", { name: `Dr. ${lastName}` })}
          </h1>
          <p className="text-ink-500">{t("dashboard.today_activity")}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/my-schedule" className="btn-secondary"><CalendarDays className="w-4 h-4" /> {t("dashboard.action.schedule_btn")}</Link>
          <Link to="/medical-records" className="btn-gradient"><FileText className="w-4 h-4" /> {t("dashboard.action.records_btn")}</Link>
        </div>
      </header>

      {metrics.isLoading ? <Spinner /> : metrics.data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label={t("dashboard.stat.today")} value={metrics.data.appointments_today} icon={CalendarClock} tone="from-brand-500 to-brand-700" />
          <StatCard label={t("dashboard.stat.this_week")} value={metrics.data.appointments_this_week} icon={CalendarDays} tone="from-accent-500 to-accent-700" />
          <StatCard label={t("dashboard.stat.my_patients")} value={metrics.data.total_patients} icon={Users} tone="from-emerald-500 to-emerald-700" />
          <StatCard label={t("dashboard.stat.to_confirm")} value={metrics.data.pending_to_confirm} icon={AlertCircle} tone="from-amber-500 to-amber-700" />
          <StatCard label={t("dashboard.stat.revenue")} value={`${Number(metrics.data.revenue_month || 0).toFixed(0)}`} icon={DollarSign} tone="from-rose-500 to-rose-700" />
        </div>
      )}

      {nextAppt && (
        <div className="card bg-gradient-to-r from-brand-500 to-brand-700 text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">{t("dashboard.next_appointment")}</div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
              <span className="text-xl">{APPOINTMENT_TYPE_ICON[nextAppt.appointment_type] ?? "🩺"}</span>
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-lg">{nextAppt.patient_name ?? `Patient #${nextAppt.patient_id}`}</div>
              <div className="text-white/80 text-sm">
                {APPOINTMENT_TYPE_LABEL[nextAppt.appointment_type] ?? "Consultation"} ·{" "}
                {new Date(nextAppt.starts_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {nextAppt.is_telemedicine && nextAppt.telemedicine_url && (
              <a href={nextAppt.telemedicine_url} target="_blank" rel="noreferrer" className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Video className="w-4 h-4" /> {t("dashboard.action.enter_call")}
              </a>
            )}
            <Link to="/appointments" className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
              {t("dashboard.view_all")}
            </Link>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{t("dashboard.weekly_agenda")}</h2>
          <Link to="/appointments" className="text-sm text-brand-600 hover:underline font-semibold">{t("dashboard.view_all")}</Link>
        </div>
        <div className="card p-2 md:p-4">
          {appts.isLoading ? <Spinner /> : <AppointmentCalendar appointments={appts.data ?? []} />}
        </div>
      </section>
    </div>
  );
}

// ── Patient dashboard ────────────────────────────────────────────────────────
function PatientDashboard({ user }: { user: any }) {
  const { t } = useI18n();
  const locale = useLocale();
  const myPatient = useQuery({ queryKey: ["my-patient"], queryFn: getMyPatient });
  const appts = useQuery({ queryKey: ["appointments", "patient"], queryFn: () => listAppointments() });

  const now = new Date().toISOString();
  const upcoming = (appts.data ?? []).filter(a => a.starts_at >= now && a.status !== "cancelled");
  const past = (appts.data ?? []).filter(a => a.starts_at < now);
  const firstName = user?.full_name?.split(" ")[0] ?? t("dashboard.welcome");

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">
            {new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("dashboard.greeting", { name: firstName })}
          </h1>
          <p className="text-ink-500">{t("dashboard.patient.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/appointments/new" className="btn-gradient"><Plus className="w-4 h-4" /> {t("dashboard.patient.book")}</Link>
          <Link to="/medical-records" className="btn-secondary"><FileText className="w-4 h-4" /> {t("dashboard.patient.records")}</Link>
        </div>
      </header>

      {appts.isLoading ? <Spinner /> : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={t("dashboard.patient.stat.total")} value={appts.data?.length ?? 0} icon={CalendarClock} tone="from-brand-500 to-brand-700" />
          <StatCard label={t("dashboard.patient.stat.telemedicine")} value={(appts.data ?? []).filter(a => a.is_telemedicine).length} icon={Video} tone="from-accent-500 to-accent-700" />
          <StatCard label={t("dashboard.patient.stat.specialties")} value={new Set((appts.data ?? []).map(a => a.specialty_name).filter(Boolean)).size} icon={Stethoscope} tone="from-emerald-500 to-emerald-700" />
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold mb-3">{t("dashboard.patient.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="card text-center py-10 text-ink-500">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">{t("dashboard.patient.no_upcoming")}</p>
            <p className="text-sm">{t("dashboard.patient.no_upcoming_sub")}</p>
            <Link to="/appointments/new" className="btn-gradient mt-4 inline-flex"><Plus className="w-4 h-4" /> {t("dashboard.patient.book")}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(appt => (
              <div key={appt.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 grid place-items-center flex-shrink-0">
                  <span className="text-2xl">{appt.is_telemedicine ? "💻" : "🩺"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">
                    {t("dashboard.patient.with")} {appt.doctor_name ?? `Dr. #${appt.doctor_id}`}
                  </div>
                  <div className="text-sm text-ink-500">
                    {new Date(appt.starts_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                    {appt.is_telemedicine && <span className="ml-2 text-xs bg-accent-100 text-accent-700 rounded px-1.5 py-0.5">{t("dashboard.patient.telemedicine")}</span>}
                  </div>
                </div>
                {appt.is_telemedicine && appt.telemedicine_url && (
                  <a href={appt.telemedicine_url} target="_blank" rel="noreferrer" className="btn-gradient btn-sm">
                    <Video className="w-3.5 h-3.5" /> {t("dashboard.patient.join")}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">{t("dashboard.patient.past")}</h2>
        {past.length === 0 ? (
          <p className="text-ink-500 text-sm">{t("dashboard.patient.no_past")}</p>
        ) : (
          <div className="space-y-2">
            {past.slice(0, 5).map(appt => (
              <div key={appt.id} className="card flex items-center gap-3 py-3">
                <div className="text-lg">🩺</div>
                <div className="flex-1 text-sm">
                  <span className="font-semibold">{appt.doctor_name ?? `Dr. #${appt.doctor_id}`}</span>
                  <span className="text-ink-400 ml-2">
                    {new Date(appt.starts_at).toLocaleDateString(locale, { dateStyle: "medium" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Router ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <div className="flex justify-center py-12"><Spinner /></div>;

  if (user.role === "patient") return <div className="p-6 max-w-5xl mx-auto"><PatientDashboard user={user} /></div>;
  if (user.role === "doctor") return <div className="p-6 max-w-7xl mx-auto"><DoctorDashboard user={user} /></div>;
  return <div className="p-6 max-w-7xl mx-auto"><AdminDashboard user={user} /></div>;
}
