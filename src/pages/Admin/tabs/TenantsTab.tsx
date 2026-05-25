import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Edit3, CheckCircle, XCircle } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";
import { listTenants, updateTenant, type Tenant } from "../../../services/tenants";

const PLAN_COLORS: Record<string, string> = {
  free: "badge-slate",
  basic: "badge-blue",
  professional: "badge-violet",
  enterprise: "badge-amber",
};

export default function TenantsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [form, setForm] = useState({ name: "", plan: "", support_email: "", is_active: true });
  const [err, setErr] = useState<string | null>(null);

  const { data: tenants = [], isLoading } = useQuery({ queryKey: ["tenants"], queryFn: listTenants });

  const save = useMutation({
    mutationFn: () => updateTenant(editing!.id, { name: form.name, plan: form.plan, support_email: form.support_email || undefined, is_active: form.is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tenants"] }); setEditing(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al actualizar"),
  });

  function openEdit(t: Tenant) {
    setForm({ name: t.name, plan: t.plan, support_email: t.support_email ?? "", is_active: t.is_active });
    setEditing(t); setErr(null);
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" /> Clínicas / Tenants
        </h2>
        <p className="text-sm text-ink-500">Gestión multi-tenant. Solo visible para super-administradores.</p>
      </div>

      {isLoading ? <Spinner /> : tenants.length === 0 ? (
        <div className="card text-ink-500 text-sm text-center py-8">No hay tenants registrados.</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Clínica</th>
                <th className="text-left px-4 py-3">Subdominio</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-semibold">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-ink-500 text-xs">{t.subdomain}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${PLAN_COLORS[t.plan] ?? "badge-slate"} capitalize`}>{t.plan}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{t.support_email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {t.is_active
                      ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Activo</span>
                      : <span className="flex items-center gap-1 text-rose-600 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Inactivo</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(t)}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar tenant" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nombre de la clínica</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="select" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              {["free", "basic", "professional", "enterprise"].map((p) => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Email de soporte</label>
            <input className="input" type="email" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} placeholder="soporte@clinica.com" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold">
              <div
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${form.is_active ? "bg-brand-600" : "bg-ink-300"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? "left-5" : "left-1"}`} />
              </div>
              Tenant activo
            </label>
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
              {save.isPending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
