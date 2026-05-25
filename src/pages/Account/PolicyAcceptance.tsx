import { useEffect, useState } from "react";
import api from "../../services/api";
import { Spinner } from "../../components/ui/Spinner";

interface Policy { id: number; kind: string; version: string; title: string; body_md: string; }

export default function PolicyAcceptance() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [accepted, setAccepted] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get<Policy[]>("/compliance/policies/active").then((r) => setPolicies(r.data));
  }, []);

  async function accept() {
    setBusy(true);
    try {
      await Promise.all(
        policies.filter((p) => accepted[p.id]).map((p) =>
          api.post("/compliance/acceptances", { policy_id: p.id })),
      );
      setDone(true);
    } finally { setBusy(false); }
  }

  if (!policies.length) return <div className="p-8"><Spinner /></div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">Términos y Privacidad</h1>
        <p className="text-sm text-ink-500">Necesitamos tu aceptación para continuar.</p>
      </header>
      {done ? (
        <div className="card border-emerald-200 bg-emerald-50 text-emerald-800">
          ¡Gracias! Quedaron registradas tus aceptaciones.
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold">{p.title}</div>
                  <div className="text-xs text-ink-500">Versión {p.version}</div>
                </div>
                <a className="text-xs text-brand-600" href={`/legal/${p.kind}`} target="_blank" rel="noreferrer">Abrir documento</a>
              </div>
              <div className="text-sm text-ink-600 max-h-40 overflow-y-auto whitespace-pre-wrap border-t border-ink-100 pt-3">
                {p.body_md.slice(0, 800)}…
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!accepted[p.id]}
                  onChange={(e) => setAccepted({ ...accepted, [p.id]: e.target.checked })} />
                Acepto este documento
              </label>
            </div>
          ))}
          <button className="btn-gradient w-full" onClick={accept}
            disabled={busy || policies.some((p) => !accepted[p.id])}>
            {busy ? "Guardando…" : "Confirmar y continuar"}
          </button>
        </div>
      )}
    </div>
  );
}
