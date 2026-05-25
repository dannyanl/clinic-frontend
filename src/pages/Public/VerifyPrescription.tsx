import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, FileText, User, Stethoscope, Clock } from "lucide-react";
import { verifyPrescription } from "../../services/verifyPrescription";

export default function VerifyPrescription() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) { setErr("Falta el token de verificación"); return; }
    verifyPrescription(token).then(setData).catch((e: any) =>
      setErr(e?.response?.data?.detail || "Receta inválida o expirada"));
  }, [token]);

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-display text-2xl font-extrabold">Clinix</span>
          </Link>
          <p className="text-sm text-ink-500">Verificador de recetas médicas</p>
        </div>

        {!data && !err && (
          <div className="card text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 grid place-items-center mx-auto">
              <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
            </div>
            <div className="text-ink-600 font-semibold">Verificando receta…</div>
          </div>
        )}

        {err && (
          <div className="card text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 grid place-items-center mx-auto">
              <XCircle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-rose-800">Receta inválida</div>
              <p className="text-sm text-ink-500 mt-1">{err}</p>
            </div>
          </div>
        )}

        {data && (
          <div className="card space-y-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-extrabold text-emerald-800 text-lg">Receta médica válida</div>
                <div className="text-emerald-600 text-sm">Emitida por Clinix · Sistema certificado</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-ink-50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">
                  <Stethoscope className="w-3.5 h-3.5" /> Profesional
                </div>
                <div className="font-bold text-ink-800">{data.doctor}</div>
                <div className="text-sm text-ink-500">Matrícula: {data.license}</div>
              </div>
              <div className="bg-ink-50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" /> Paciente
                </div>
                <div className="font-bold text-ink-800">{data.patient}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Clock className="w-4 h-4 text-ink-400" />
              Emitida: {new Date(data.issued_at).toLocaleString("es-AR")}
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-ink-800 mb-3">
                <FileText className="w-5 h-5 text-brand-600" /> Medicamentos recetados
              </div>
              <div className="space-y-2">
                {(data.items ?? []).map((p: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold grid place-items-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    <div>
                      <div className="font-semibold text-brand-800">{p.drug}</div>
                      {p.dosage && <div className="text-sm text-brand-600">{p.dosage}</div>}
                      {p.frequency && <div className="text-xs text-brand-500">{p.frequency}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
