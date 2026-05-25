import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Send, CheckCircle, XCircle } from "lucide-react";
import { surveys } from "../../services/surveys";

const LABELS: Record<number, string> = {
  0: "Muy improbable", 1: "", 2: "", 3: "", 4: "", 5: "", 6: "",
  7: "Neutral", 8: "", 9: "", 10: "Muy probable"
};

export default function SurveyForm() {
  const { token = "" } = useParams();
  const [score, setScore] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    surveys.open(token).then(setInfo).catch((e: any) =>
      setErr(e?.response?.data?.detail || "Encuesta no encontrada"));
  }, [token]);

  async function submit() {
    if (score === null) return;
    setSending(true);
    try {
      await surveys.answer(token, { nps_score: score, comments });
      setDone(true);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "No se pudo enviar");
    } finally { setSending(false); }
  }

  const npsColor = (i: number) => {
    if (i <= 6) return score === i ? "bg-rose-500 text-white border-rose-500" : "bg-white border-ink-200 hover:border-rose-400 hover:bg-rose-50";
    if (i <= 8) return score === i ? "bg-amber-500 text-white border-amber-500" : "bg-white border-ink-200 hover:border-amber-400 hover:bg-amber-50";
    return score === i ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-ink-200 hover:border-emerald-400 hover:bg-emerald-50";
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="card max-w-md w-full text-center py-12 space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-emerald-800">¡Gracias por tu opinión!</div>
          <p className="text-sm text-ink-500 mt-2">Tu respuesta nos ayuda a mejorar el servicio continuamente.</p>
        </div>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="card max-w-md w-full text-center py-12 space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-100 grid place-items-center mx-auto">
          <XCircle className="w-8 h-8 text-rose-600" />
        </div>
        <div className="text-xl font-bold text-rose-800">{err}</div>
      </div>
    </div>
  );

  if (!info) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="text-ink-500 animate-pulse">Cargando encuesta…</div>
    </div>
  );

  if (info.answered) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="card max-w-md w-full text-center py-12 space-y-4">
        <div className="text-xl font-bold">Esta encuesta ya fue respondida.</div>
        <p className="text-sm text-ink-500">Gracias por tu participación anterior.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-display text-2xl font-extrabold">Clinix</span>
          </div>
          <h1 className="text-2xl font-extrabold">¿Nos recomendarías?</h1>
          <p className="text-ink-500 mt-2">Del 0 al 10, ¿qué tan probable es que recomiendes nuestra clínica a alguien?</p>
        </div>

        <div className="card space-y-6">
          <div>
            <div className="flex justify-between text-xs text-ink-400 mb-2 px-1">
              <span>Muy improbable (0)</span>
              <span>Muy probable (10)</span>
            </div>
            <div className="grid grid-cols-11 gap-1.5">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  title={LABELS[i] || String(i)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${npsColor(i)}`}
                >
                  {i}
                </button>
              ))}
            </div>
            {score !== null && (
              <div className="mt-3 text-center">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  score <= 6 ? "bg-rose-100 text-rose-700" :
                  score <= 8 ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {score <= 6 ? "Detractor" : score <= 8 ? "Pasivo" : "Promotor"} · {score}/10
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" /> Comentarios (opcional)
            </label>
            <textarea
              className="input w-full"
              rows={4}
              placeholder="¿Qué podríamos mejorar? ¿Qué fue lo que más te gustó?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <button
            onClick={submit}
            disabled={score === null || sending}
            className="btn-gradient w-full"
          >
            {sending ? "Enviando…" : <><Send className="w-4 h-4" /> Enviar opinión</>}
          </button>
        </div>
      </div>
    </div>
  );
}
