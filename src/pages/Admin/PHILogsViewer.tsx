import { useEffect, useState } from "react";
import api from "../../services/api";
import { ShieldCheck, Filter } from "lucide-react";

interface PHILog {
  id: number; user_id: number; patient_id?: number; action: string;
  resource: string; resource_id?: number; ip?: string; created_at: string;
}

const ACTIONS = ["", "view", "edit", "export", "delete", "share"] as const;

export default function PHILogsViewer() {
  const [rows, setRows] = useState<PHILog[]>([]);
  const [action, setAction] = useState<string>("");
  const [patient, setPatient] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (action) params.action = action;
      if (patient) params.patient_id = patient;
      const r = await api.get<PHILog[]>("/compliance/phi-access-logs", { params });
      setRows(r.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-5">
      <header className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-brand-600" />
        <div>
          <h1 className="text-2xl font-extrabold">Auditoría de acceso a PHI</h1>
          <p className="text-sm text-ink-500">Registro inmutable de accesos a información clínica protegida.</p>
        </div>
      </header>
      <div className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label flex items-center gap-1"><Filter className="w-3 h-3" /> Acción</label>
          <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTIONS.map((a) => <option key={a} value={a}>{a || "Todas"}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Paciente ID</label>
          <input className="input" value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="ej: 42" />
        </div>
        <button className="btn-primary" onClick={load}>Filtrar</button>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Acción</th>
              <th className="px-4 py-3 text-left">Recurso</th>
              <th className="px-4 py-3 text-left">Paciente</th>
              <th className="px-4 py-3 text-left">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-ink-500" colSpan={6}>Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-6 text-center text-ink-500" colSpan={6}>Sin registros.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="px-4 py-2.5 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2.5">#{r.user_id}</td>
                <td className="px-4 py-2.5"><span className="badge-blue">{r.action}</span></td>
                <td className="px-4 py-2.5">{r.resource}{r.resource_id ? ` #${r.resource_id}` : ""}</td>
                <td className="px-4 py-2.5">{r.patient_id ?? "-"}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.ip ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
