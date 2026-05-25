import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Plus, CheckCircle, XCircle, Edit3, Users, BarChart3,
  Globe, Zap, AlertTriangle, TrendingUp, DollarSign
} from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import {
  listAllTenants, createTenant, updateTenantAdmin,
  suspendTenant, activateTenant, getSuperAdminStats,
  type SuperAdminStats,
} from "../../services/superadmin";
import type { Tenant } from "../../types";
import { useI18n } from "../../i18n";

const PLAN_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string | number; icon: React.FC<any>; tone: string }) {
  return (
    <div className="card relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${tone} opacity-10`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} grid place-items-center shadow mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-ink-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function SuperAdminPanel() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<Tenant | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({
    name: "", subdomain: "", plan: "pro",
    support_email: "", admin_email: "", admin_name: "", admin_password: "",
  });
  const [editForm, setEditForm] = useState({ name: "", plan: "pro", support_email: "", is_active: true });

  const stats = useQuery({ queryKey: ["superadmin-stats"], queryFn: getSuperAdminStats });
  const tenants = useQuery({ queryKey: ["all-tenants"], queryFn: listAllTenants });

  const create = useMutation({
    mutationFn: () => createTenant(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-tenants", "superadmin-stats"] }); setCreateModal(false); setErr(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const update = useMutation({
    mutationFn: () => updateTenantAdmin(editModal!.id, editForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-tenants"] }); setEditModal(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const suspend = useMutation({
    mutationFn: suspendTenant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-tenants", "superadmin-stats"] }),
    onError: (e: any) => alert(e?.response?.data?.detail || t("common.error")),
  });

  const activate = useMutation({
    mutationFn: activateTenant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-tenants", "superadmin-stats"] }),
    onError: (e: any) => alert(e?.response?.data?.detail || t("common.error")),
  });

  function openEdit(ten: Tenant) {
    setEditForm({ name: ten.name, plan: ten.plan, support_email: (ten as any).support_email ?? "", is_active: ten.is_active });
    setEditModal(ten); setErr(null);
  }

  const s: SuperAdminStats | undefined = stats.data;

  const filtered = (tenants.data ?? []).filter((ten) =>
    !q || ten.name.toLowerCase().includes(q.toLowerCase()) || ten.subdomain.toLowerCase().includes(q.toLowerCase())
  );
  const total = (tenants.data ?? []).length;
  const activeCount = (tenants.data ?? []).filter((ten) => ten.is_active).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold">{t("superadmin.title")}</h1>
          </div>
          <p className="text-sm text-ink-500 ml-13">{t("superadmin.subtitle")}</p>
        </div>
        <button className="btn-gradient flex items-center gap-2 flex-shrink-0" onClick={() => { setErr(null); setCreateModal(true); }}>
          <Plus className="w-4 h-4" /> {t("superadmin.addTenant")}
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("superadmin.total")} value={total} icon={Globe} tone="from-accent-500 to-accent-700" />
        <StatCard label={t("superadmin.active")} value={activeCount} icon={Building2} tone="from-brand-500 to-brand-700" />
        <StatCard label={t("superadmin.inactive")} value={total - activeCount} icon={XCircle} tone="from-rose-500 to-rose-700" />
      </div>

      {s && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label={t("superadmin.patients")} value={s.total_users} icon={Users} tone="from-emerald-500 to-emerald-700" />
          <StatCard label="Appts / hoy" value={s.total_appointments_today} icon={BarChart3} tone="from-amber-500 to-amber-700" />
          <StatCard label="Rev / mes" value={`$${Number(s.total_revenue_month || 0).toFixed(0)}`} icon={DollarSign} tone="from-rose-500 to-rose-700" />
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" /> {t("superadmin.title")}
          </h2>
          <input className="input max-w-xs" placeholder={t("superadmin.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {tenants.isLoading ? <Spinner /> : (
          <div className="space-y-3">
            {filtered.map((ten) => (
              <div key={ten.id} className="card flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gradient grid place-items-center text-white font-extrabold text-lg flex-shrink-0 shadow">
                  {ten.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-lg">{ten.name}</span>
                    <span className="badge badge-blue capitalize">{ten.plan}</span>
                    {ten.is_active
                      ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> {t("superadmin.active")}</span>
                      : <span className="flex items-center gap-1 text-rose-600 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> {t("superadmin.inactive")}</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-ink-500">
                    <span className="font-mono">{ten.subdomain}.clinix.app</span>
                    <span>{t("superadmin.name")}: {new Date(ten.created_at).toLocaleDateString()}</span>
                  </div>
                  {(ten as any).stats && (
                    <div className="flex gap-4 mt-2 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(ten as any).stats.total_patients} {t("superadmin.patients")}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {(ten as any).stats.total_doctors} {t("superadmin.doctors")}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {(ten as any).stats.appointments_this_month} {t("superadmin.thisMonth")}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="btn-secondary btn-sm" onClick={() => openEdit(ten)}><Edit3 className="w-3.5 h-3.5" /></button>
                  {ten.is_active ? (
                    <button className="btn-danger btn-sm flex items-center gap-1.5" disabled={suspend.isPending}
                      onClick={() => window.confirm(t("superadmin.suspendMsg", { name: ten.name })) && suspend.mutate(ten.id)}>
                      <AlertTriangle className="w-3.5 h-3.5" /> {t("superadmin.deactivateTitle")}
                    </button>
                  ) : (
                    <button className="btn-secondary btn-sm flex items-center gap-1.5 text-emerald-700 border-emerald-300"
                      disabled={activate.isPending} onClick={() => activate.mutate(ten.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> {t("superadmin.activateAction")}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card text-center py-10 text-ink-500">{t("superadmin.noTenants")}</div>
            )}
          </div>
        )}
      </section>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title={t("superadmin.createModal.title")} size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {t("superadmin.subtitle")}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">{t("superadmin.clinicName")} *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Clínica San Martín" />
            </div>
            <div>
              <label className="label">{t("superadmin.subdomainLabel")} *</label>
              <div className="flex items-center">
                <input className="input rounded-r-none" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="sanmartin" />
                <span className="bg-ink-100 border border-l-0 border-ink-300 rounded-r-xl px-3 py-2 text-sm text-ink-500 whitespace-nowrap">.clinix.app</span>
              </div>
            </div>
            <div>
              <label className="label">{t("superadmin.planLabel")}</label>
              <select className="select" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                {PLAN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">{t("superadmin.adminEmail")} *</label>
              <input className="input" type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} placeholder="admin@clinica.com" />
            </div>
            <div>
              <label className="label">{t("patients.fullName")} *</label>
              <input className="input" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} placeholder="Dr. Juan Pérez" />
            </div>
            <div>
              <label className="label">{t("superadmin.adminPassword")} *</label>
              <input className="input" type="password" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} placeholder={t("patients.passwordPh")} />
            </div>
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setCreateModal(false)}>{t("common.cancel")}</button>
            <button className="btn-gradient" onClick={() => create.mutate()} disabled={create.isPending || !form.name || !form.subdomain || !form.admin_email || !form.admin_password}>
              {create.isPending ? t("superadmin.creating") : <><Plus className="w-4 h-4" /> {t("superadmin.create")}</>}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal !== null} onClose={() => setEditModal(null)} title={`${t("patients.editTitle")}: ${editModal?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{t("superadmin.name")}</label>
            <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("superadmin.plan")}</label>
            <select className="select" value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}>
              {PLAN_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold">
            <div onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
              className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${editForm.is_active ? "bg-brand-600" : "bg-ink-300"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${editForm.is_active ? "left-6" : "left-1"}`} />
            </div>
            {t("superadmin.active")}
          </label>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setEditModal(null)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={() => update.mutate()} disabled={update.isPending}>
              {update.isPending ? t("patients.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
