import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToggleLeft, ToggleRight, ChevronDown } from "lucide-react";

import { Spinner } from "../../../components/ui/Spinner";
import { listUsers, updateUser } from "../../../services/admin";
import type { User } from "../../../types";

const ROLES = ["patient", "doctor", "receptionist", "admin"];
const ROLE_LABELS: Record<string, string> = { patient: "Paciente", doctor: "Doctor", receptionist: "Recepcionista", admin: "Admin" };
const ROLE_BADGE: Record<string, string> = {
  admin: "badge-violet", doctor: "badge-blue", receptionist: "badge-green", patient: "badge-slate",
};

export default function UsersTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["users-admin"], queryFn: listUsers });
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const toggle = useMutation({
    mutationFn: (u: User) => updateUser(u.id, { is_active: !u.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users-admin"] }),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => updateUser(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users-admin"] }),
  });

  const filtered = data.filter((u) => {
    const matchQ = !q || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const matchR = !roleFilter || u.role === roleFilter;
    return matchQ && matchR;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Usuarios del sistema</h2>
          <p className="text-sm text-ink-500">{data.length} usuarios registrados</p>
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 mb-4">
        <input className="input sm:max-w-xs" placeholder="Buscar por nombre o email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select sm:max-w-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-ink-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center gap-1">
                      <span className={`badge ${ROLE_BADGE[u.role] ?? "badge-slate"}`}>{ROLE_LABELS[u.role] ?? u.role}</span>
                      <select
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={u.role}
                        onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value })}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-ink-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle.mutate(u)}
                      className={`flex items-center gap-1 text-xs font-semibold ${u.is_active ? "text-emerald-600" : "text-ink-400"}`}
                    >
                      {u.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {u.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right text-ink-400 text-xs">#{u.id}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-ink-400">Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
