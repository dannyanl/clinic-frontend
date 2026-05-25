import { useState } from "react";
import api from "../../services/api";
import { Download, FileDown } from "lucide-react";

export default function DataExportRequest() {
  const [reqId, setReqId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function instant() {
    const r = await api.get("/compliance/me/data-export.json");
    const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mis-datos.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function gdpr(kind: "export" | "delete") {
    setBusy(true);
    try {
      const r = await api.post("/compliance/data-requests", { kind });
      setReqId(r.data.id);
    } finally { setBusy(false); }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">Mis datos personales</h1>
        <p className="text-sm text-ink-500">Ejercé tus derechos de acceso, portabilidad y supresión (GDPR / Ley 25.326).</p>
      </header>
      <div className="card">
        <div className="flex items-start gap-4">
          <Download className="w-7 h-7 text-brand-600" />
          <div className="flex-1">
            <div className="font-bold">Descarga inmediata (JSON)</div>
            <p className="text-sm text-ink-600">Obtené ahora una copia de tu perfil, citas y registros de cumplimiento.</p>
          </div>
          <button className="btn-primary" onClick={instant}>Descargar</button>
        </div>
      </div>
      <div className="card">
        <div className="flex items-start gap-4">
          <FileDown className="w-7 h-7 text-accent-600" />
          <div className="flex-1">
            <div className="font-bold">Solicitud formal (DPO)</div>
            <p className="text-sm text-ink-600">Genera un caso para el equipo de privacidad. Recibirás respuesta en menos de 30 días.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => gdpr("export")} disabled={busy}>Exportación</button>
            <button className="btn-danger" onClick={() => gdpr("delete")} disabled={busy}>Solicitar supresión</button>
          </div>
        </div>
        {reqId && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
            Solicitud registrada con ID #{reqId}. Te contactaremos al email asociado.
          </div>
        )}
      </div>
    </div>
  );
}
