import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";
import { listDataRequests, resolveDataRequest } from "../../../services/compliance";

const STATUS_COLOR: Record<string, string> = {
  pending: "badge-amber",
  processing: "badge-blue",
  completed: "badge-green",
  rejected: "badge-rose",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  completed: "Completado",
  rejected: "Rechazado",
};

const TYPE_LABEL: Record<string, string> = {
  export: "Exportación de datos",
  deletion: "Eliminación de cuenta",
};

export default function GdprTab() {
  const qc = useQueryClient();
  const [resolving, setResolving] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"completed" | "rejected">("completed");
  const [err, setErr] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["data-requests"],
    queryFn: listDataRequests,
  });

  const resolve = useMutation({
    mutationFn: () => resolveDataRequest(resolving!, { status: action, notes: notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["data-requests"] }); setResolving(null); setNotes(""); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al resolver"),
  });

  const pending = requests.filter((r) => r.status === "pending" || r.status === "processing");
  const resolved = requests.filter((r) => r.status === "completed" || r.status === "rejected");

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-600" /> Solicitudes GDPR / Privacidad
        </h2>
        <p className="text-sm text-ink-500">Solicitudes de exportación y eliminación de datos de usuarios. Tiempo de respuesta requerido: 30 días.</p>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-6">
          {/* Pendientes */}
          <div>
            <h3 className="font-bold mb-3 text-ink-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Pendientes de resolución ({pending.length})
            </h3>
            {pending.length === 0 ? (
              <div className="card text-ink-500 text-sm text-center py-6">No hay solicitudes pendientes.</div>
            ) : (
              <div className="space-y-2">
                {pending.map((r) => (
                  <div key={r.id} className="card flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{r.user_email}</span>
                        <span className="badge-blue text-xs">{TYPE_LABEL[r.type] ?? r.type}</span>
                        <span className={`badge ${STATUS_COLOR[r.status]} text-xs`}>{STATUS_LABEL[r.status]}</span>
                      </div>
                      <div className="text-xs text-ink-400 mt-1">Solicitado: {new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      className="btn-primary btn-sm flex items-center gap-1.5"
                      onClick={() => { setResolving(r.id); setAction("completed"); setNotes(""); setErr(null); }}>
                      <Eye className="w-3.5 h-3.5" /> Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resueltas */}
          {resolved.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 text-ink-700">Historial resuelto ({resolved.length})</h3>
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Usuario</th>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Resuelto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((r) => (
                      <tr key={r.id} className="border-t border-ink-100">
                        <td className="px-4 py-3">{r.user_email}</td>
                        <td className="px-4 py-3">{TYPE_LABEL[r.type] ?? r.type}</td>
                        <td className="px-4 py-3"><span className={`badge ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span></td>
                        <td className="px-4 py-3 text-ink-500">{r.resolved_at ? new Date(r.resolved_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={resolving !== null} onClose={() => setResolving(null)} title="Resolver solicitud GDPR" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Indicá si la solicitud fue procesada correctamente o si fue rechazada (con justificación legal).
          </p>
          <div>
            <label className="label">Resultado</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setAction("completed")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition ${action === "completed" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-ink-200 hover:border-emerald-300"}`}>
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Completado
              </button>
              <button onClick={() => setAction("rejected")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition ${action === "rejected" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-ink-200 hover:border-rose-300"}`}>
                <XCircle className="w-4 h-4 text-rose-600" /> Rechazado
              </button>
            </div>
          </div>
          <div>
            <label className="label">Notas internas (opcional)</label>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Razones, referencias, número de ticket…" />
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setResolving(null)}>Cancelar</button>
            <button className="btn-primary" onClick={() => resolve.mutate()} disabled={resolve.isPending}>
              {resolve.isPending ? "Guardando…" : "Confirmar resolución"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
