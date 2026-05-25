import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../../../components/ui/Spinner";
import { listLogs } from "../../../services/admin";

export default function ActivityTab() {
  const { data = [], isLoading } = useQuery({ queryKey: ["activity-logs"], queryFn: listLogs });

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Log de actividad</h2>
        <p className="text-sm text-ink-500">Últimas {data.length} acciones registradas en el sistema.</p>
      </div>
      {isLoading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Usuario</th>
                <th className="text-left px-4 py-3">Acción</th>
                <th className="text-left px-4 py-3">Entidad</th>
                <th className="text-left px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l: any) => (
                <tr key={l.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-4 py-2.5 font-mono text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2.5">#{l.user_id ?? "—"}</td>
                  <td className="px-4 py-2.5"><span className="badge-blue">{l.action}</span></td>
                  <td className="px-4 py-2.5">{l.entity ?? "—"}{l.entity_id ? ` #${l.entity_id}` : ""}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-400">{l.ip ?? "—"}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-ink-400">Sin actividad registrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
