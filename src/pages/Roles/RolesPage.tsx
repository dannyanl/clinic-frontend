import { Link } from "react-router-dom";
import {
  ShieldCheck, Stethoscope, Users, ClipboardList, Heart,
  Globe, Check, X, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";

interface Permission {
  feature: string;
  category: string;
  superadmin: boolean;
  admin: boolean;
  doctor: boolean;
  receptionist: boolean;
  patient: boolean;
}

const PERMISSIONS: Permission[] = [
  { feature: "View own appointments", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: true },
  { feature: "Book appointment for another", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: false },
  { feature: "Confirm / complete appointments", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: false },
  { feature: "Patient check-in", category: "Appointments", superadmin: true, admin: true, doctor: false, receptionist: true, patient: false },
  { feature: "Cancel own appointment", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: true },
  { feature: "Recurring appointments", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: false },
  { feature: "Telemedicine appointments", category: "Appointments", superadmin: true, admin: true, doctor: true, receptionist: true, patient: true },
  { feature: "View patient list", category: "Patients", superadmin: true, admin: true, doctor: true, receptionist: true, patient: false },
  { feature: "Create / edit patients", category: "Patients", superadmin: true, admin: true, doctor: false, receptionist: true, patient: false },
  { feature: "View own medical profile", category: "Patients", superadmin: false, admin: false, doctor: false, receptionist: false, patient: true },
  { feature: "View own medical records", category: "Medical Records", superadmin: false, admin: false, doctor: false, receptionist: false, patient: true },
  { feature: "Create medical consultations", category: "Medical Records", superadmin: false, admin: true, doctor: true, receptionist: false, patient: false },
  { feature: "Issue prescriptions", category: "Medical Records", superadmin: false, admin: false, doctor: true, receptionist: false, patient: false },
  { feature: "Attach medical files", category: "Medical Records", superadmin: true, admin: true, doctor: true, receptionist: false, patient: false },
  { feature: "Manage own schedule", category: "Schedule", superadmin: false, admin: true, doctor: true, receptionist: false, patient: false },
  { feature: "Register absences / vacations", category: "Schedule", superadmin: false, admin: true, doctor: true, receptionist: false, patient: false },
  { feature: "Subscribe iCal calendar", category: "Schedule", superadmin: false, admin: true, doctor: true, receptionist: true, patient: false },
  { feature: "View own payments", category: "Billing", superadmin: true, admin: true, doctor: false, receptionist: true, patient: true },
  { feature: "Mark payments as collected", category: "Billing", superadmin: true, admin: true, doctor: false, receptionist: true, patient: false },
  { feature: "View revenue reports", category: "Billing", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "Manage doctors", category: "Administration", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "Manage users and roles", category: "Administration", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "Configure reminders", category: "Administration", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "View PHI audit log", category: "Administration", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "Resolve GDPR requests", category: "Administration", superadmin: true, admin: true, doctor: false, receptionist: false, patient: false },
  { feature: "Create new clinics", category: "Super Admin", superadmin: true, admin: false, doctor: false, receptionist: false, patient: false },
  { feature: "Suspend / activate clinics", category: "Super Admin", superadmin: true, admin: false, doctor: false, receptionist: false, patient: false },
  { feature: "View global statistics", category: "Super Admin", superadmin: true, admin: false, doctor: false, receptionist: false, patient: false },
  { feature: "Manage plans and billing", category: "Super Admin", superadmin: true, admin: false, doctor: false, receptionist: false, patient: false },
];

const ROLES = [
  { key: "superadmin", label: "Super Admin", icon: Globe, color: "from-amber-500 to-orange-600", desc: "Manages entire clinic network" },
  { key: "admin", label: "Admin", icon: ShieldCheck, color: "from-accent-500 to-accent-700", desc: "Manages one clinic" },
  { key: "doctor", label: "Doctor", icon: Stethoscope, color: "from-brand-500 to-brand-700", desc: "Sees patients, issues prescriptions" },
  { key: "receptionist", label: "Receptionist", icon: ClipboardList, color: "from-emerald-500 to-emerald-700", desc: "Coordinates schedule and check-in" },
  { key: "patient", label: "Patient", icon: Heart, color: "from-rose-500 to-rose-700", desc: "Access to own health information" },
] as const;

const CATEGORIES = [...new Set(PERMISSIONS.map((p) => p.category))];

function YN({ val }: { val: boolean }) {
  return val
    ? <Check className="w-4 h-4 text-emerald-600 mx-auto" />
    : <X className="w-4 h-4 text-ink-200 mx-auto" />;
}

export default function RolesPage() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Users className="w-7 h-7 text-brand-600" /> {t("roles.title")}
        </h1>
        <p className="text-sm text-ink-500">{t("roles.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ROLES.map((r) => (
          <div key={r.key} className={`card text-center space-y-2 ${role === r.key ? "ring-2 ring-brand-400" : ""}`}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.color} grid place-items-center shadow-md mx-auto`}>
              <r.icon className="w-6 h-6 text-white" />
            </div>
            <div className="font-extrabold text-sm">{r.label}</div>
            <div className="text-xs text-ink-500 leading-snug">{r.desc}</div>
            {role === r.key && (
              <div className="text-xs font-bold text-brand-600 bg-brand-50 rounded-lg py-1">{t("roles.currentRole")}</div>
            )}
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50">
                <th className="text-left px-4 py-3 font-bold text-ink-700 w-64">{t("roles.user")}</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="px-3 py-3 text-center">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${r.color} grid place-items-center shadow mx-auto mb-1`}>
                      <r.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="font-bold text-xs text-ink-700 whitespace-nowrap">{r.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <>
                  <tr key={`cat-${cat}`}>
                    <td colSpan={6} className="px-4 py-2 bg-brand-50 border-t border-b border-brand-100">
                      <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider">{cat}</span>
                    </td>
                  </tr>
                  {PERMISSIONS.filter((p) => p.category === cat).map((p) => (
                    <tr key={p.feature} className="border-t border-ink-100 hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 text-ink-700">{p.feature}</td>
                      <td className="px-3 py-2.5 text-center"><YN val={p.superadmin} /></td>
                      <td className="px-3 py-2.5 text-center"><YN val={p.admin} /></td>
                      <td className="px-3 py-2.5 text-center"><YN val={p.doctor} /></td>
                      <td className="px-3 py-2.5 text-center"><YN val={p.receptionist} /></td>
                      <td className="px-3 py-2.5 text-center"><YN val={p.patient} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-brand-gradient text-white flex flex-col md:flex-row items-center gap-4 p-6">
        <div className="flex-1">
          <div className="font-extrabold text-xl mb-1">{t("roles.changeRole")}</div>
          <p className="text-white/80 text-sm">{t("roles.subtitle")}</p>
        </div>
        {(role === "admin" || role === "superadmin") && (
          <Link to="/admin" className="btn-secondary bg-white text-brand-700 border-white hover:bg-brand-50 flex-shrink-0">
            {t("admin.title")} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
