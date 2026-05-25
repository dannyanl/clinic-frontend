import { useQuery } from "@tanstack/react-query";
import { Star, ThumbsUp, ThumbsDown, Minus, TrendingUp } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import { getNpsAggregate } from "../../../services/reports";

export default function NpsTab() {
  const { data, isLoading, error } = useQuery({ queryKey: ["nps-aggregate"], queryFn: getNpsAggregate });

  const npsColor = data
    ? data.nps_score >= 50 ? "text-emerald-700" : data.nps_score >= 0 ? "text-amber-700" : "text-rose-700"
    : "";
  const npsBg = data
    ? data.nps_score >= 50 ? "from-emerald-500 to-emerald-700" : data.nps_score >= 0 ? "from-amber-500 to-amber-700" : "from-rose-500 to-rose-700"
    : "from-brand-500 to-brand-700";

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> NPS — Satisfacción de pacientes
        </h2>
        <p className="text-sm text-ink-500">Encuestas enviadas automáticamente tras cada consulta completada.</p>
      </div>

      {isLoading && <Spinner />}
      {error && <div className="card text-rose-600 text-sm">No se pudieron cargar los datos de NPS.</div>}

      {data && (
        <div className="space-y-6">
          {/* Score principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`md:col-span-1 card flex flex-col items-center justify-center py-8 bg-gradient-to-br ${npsBg} text-white`}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-white/70">Puntaje NPS</div>
              <div className="text-6xl font-extrabold">{data.nps_score}</div>
              <div className="text-white/70 text-sm mt-2">de {data.total} respuestas</div>
            </div>

            <div className="card flex flex-col items-center justify-center py-6 bg-emerald-50 border-emerald-200">
              <ThumbsUp className="w-7 h-7 text-emerald-600 mb-2" />
              <div className="text-3xl font-extrabold text-emerald-700">{data.promoters}</div>
              <div className="text-sm font-semibold text-emerald-600">Promotores</div>
              <div className="text-xs text-ink-400 mt-1">Puntaje 9–10</div>
            </div>

            <div className="card flex flex-col items-center justify-center py-6 bg-amber-50 border-amber-200">
              <Minus className="w-7 h-7 text-amber-600 mb-2" />
              <div className="text-3xl font-extrabold text-amber-700">{data.passives}</div>
              <div className="text-sm font-semibold text-amber-600">Pasivos</div>
              <div className="text-xs text-ink-400 mt-1">Puntaje 7–8</div>
            </div>

            <div className="card flex flex-col items-center justify-center py-6 bg-rose-50 border-rose-200">
              <ThumbsDown className="w-7 h-7 text-rose-600 mb-2" />
              <div className="text-3xl font-extrabold text-rose-700">{data.detractors}</div>
              <div className="text-sm font-semibold text-rose-600">Detractores</div>
              <div className="text-xs text-ink-400 mt-1">Puntaje 0–6</div>
            </div>
          </div>

          {/* Interpretación */}
          <div className="card bg-ink-50 border-ink-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              <div className="font-bold">¿Cómo leer el NPS?</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { range: "NPS ≥ 50", label: "Excelente", desc: "Clínica muy recomendada por sus pacientes", color: "text-emerald-700 bg-emerald-50" },
                { range: "NPS 0–49", label: "Bueno", desc: "Hay oportunidades de mejora concretas", color: "text-amber-700 bg-amber-50" },
                { range: "NPS < 0", label: "Crítico", desc: "Requiere atención urgente en experiencia del paciente", color: "text-rose-700 bg-rose-50" },
              ].map((item) => (
                <div key={item.range} className={`rounded-xl p-3 ${item.color}`}>
                  <div className="font-bold">{item.range}</div>
                  <div className="font-semibold text-xs mt-0.5">{item.label}</div>
                  <div className="text-xs mt-1 opacity-80">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Formula */}
          <div className="card text-sm text-ink-600">
            <div className="font-semibold mb-1">Fórmula: NPS = % Promotores − % Detractores</div>
            <div className="text-ink-400">
              {data.total > 0
                ? `${((data.promoters / data.total) * 100).toFixed(1)}% promotores − ${((data.detractors / data.total) * 100).toFixed(1)}% detractores = ${data.nps_score}`
                : "Sin datos suficientes aún."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
