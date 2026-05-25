import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, CalendarX, Download, Star, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import { getCancellations, getOccupancy, getRevenue, getNpsAggregate, buildExportUrl } from "../../services/reports";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";

function Bar({ value, max, color = "bg-brand-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-3 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{value}</span>
    </div>
  );
}

function PctBar({ pct, color = "bg-brand-500" }: { pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-3 rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold w-12 text-right">{pct.toFixed(1)}%</span>
    </div>
  );
}

export default function Reports() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "admin";
  const [from, setFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const occupancy = useQuery({ queryKey: ["occ", from, to], queryFn: () => getOccupancy(from, to) });
  const cancel = useQuery({ queryKey: ["canc", from, to], queryFn: () => getCancellations(from, to) });
  const revenue = useQuery({ queryKey: ["rev", from, to], queryFn: () => getRevenue(from, to), enabled: isAdmin });
  const nps = useQuery({ queryKey: ["nps-agg"], queryFn: getNpsAggregate, enabled: isAdmin });

  const maxSlots = Math.max(...(occupancy.data ?? []).map((r: any) => r.total_slots), 1);
  const maxRev = Math.max(...Object.values((revenue.data?.by_doctor ?? {}) as Record<string, number>), 1);

  function downloadExport(type: Parameters<typeof buildExportUrl>[0]) {
    const url = buildExportUrl(type, { date_from: from, date_to: to });
    const a = document.createElement("a"); a.href = url; a.click();
  }

  const dayCount = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2"><BarChart3 className="w-7 h-7 text-brand-600" /> {t("reports.title")}</h1>
          <p className="text-sm text-ink-500">{t("reports.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadExport("appointments_csv")} className="btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> {t("reports.exportApptCsv")}
          </button>
          <button onClick={() => downloadExport("appointments_xlsx")} className="btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> {t("reports.exportApptXlsx")}
          </button>
          <button onClick={() => downloadExport("appointments_pdf")} className="btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> {t("reports.exportApptPdf")}
          </button>
          {isAdmin && (
            <button onClick={() => downloadExport("patients_csv")} className="btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" /> {t("reports.exportPatientsCsv")}
            </button>
          )}
        </div>
      </header>

      <div className="card flex flex-wrap gap-4 items-end">
        <div><label className="label">{t("reports.from")}</label><input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">{t("reports.to")}</label><input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="text-sm text-ink-400 self-end pb-2">{dayCount} {t("reports.daysSelected")}</div>
      </div>

      {isAdmin && (
        <section className="card">
          <h2 className="font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> {t("reports.nps")}</h2>
          {nps.isLoading ? <Spinner /> : nps.data ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-white/70">{t("reports.npsScore")}</div>
                <div className={`text-5xl font-extrabold ${nps.data.nps_score >= 50 ? "text-white" : nps.data.nps_score >= 0 ? "text-amber-200" : "text-rose-200"}`}>
                  {nps.data.nps_score}
                </div>
                <div className="text-white/70 text-sm mt-1">{t("reports.responses", { count: String(nps.data.total) })} {nps.data.total}</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <ThumbsUp className="w-6 h-6 text-emerald-600 mb-1" />
                <div className="text-2xl font-extrabold text-emerald-700">{nps.data.promoters}</div>
                <div className="text-xs text-emerald-600">{t("reports.promoters")}</div>
                <div className="text-xs text-ink-400">(9–10)</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <Minus className="w-6 h-6 text-amber-600 mb-1" />
                <div className="text-2xl font-extrabold text-amber-700">{nps.data.passives}</div>
                <div className="text-xs text-amber-600">{t("reports.passives")}</div>
                <div className="text-xs text-ink-400">(7–8)</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <ThumbsDown className="w-6 h-6 text-rose-600 mb-1" />
                <div className="text-2xl font-extrabold text-rose-700">{nps.data.detractors}</div>
                <div className="text-xs text-rose-600">{t("reports.detractors")}</div>
                <div className="text-xs text-ink-400">(0–6)</div>
              </div>
            </div>
          ) : (
            <div className="text-ink-400 text-sm">{t("reports.noNps")}</div>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cancel.data && [
          { label: t("reports.totalAppts"), value: cancel.data.total, icon: BarChart3, tone: "from-brand-500 to-brand-700" },
          { label: t("reports.completed"), value: cancel.data.total - cancel.data.cancelled - cancel.data.no_show, icon: TrendingUp, tone: "from-emerald-500 to-emerald-700" },
          { label: t("reports.cancelled"), value: cancel.data.cancelled, icon: CalendarX, tone: "from-rose-500 to-rose-700" },
          { label: t("reports.noShow"), value: cancel.data.no_show, icon: CalendarX, tone: "from-amber-500 to-amber-700" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card relative overflow-hidden">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} grid place-items-center shadow mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-ink-500 uppercase tracking-wide">{label}</div>
          </div>
        ))}
        {cancel.isLoading && <div className="col-span-4 flex justify-center py-4"><Spinner /></div>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card">
          <h2 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-600" /> {t("reports.occupancy")}</h2>
          {occupancy.isLoading ? <Spinner /> : (occupancy.data ?? []).length === 0 ? (
            <div className="text-ink-400 text-sm">{t("reports.noOccupancy")}</div>
          ) : (
            <div className="space-y-4">
              {(occupancy.data ?? []).map((r: any) => (
                <div key={r.doctor_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold truncate max-w-[180px]">{r.doctor_name}</span>
                    <span className="text-ink-500 text-xs">{r.booked_slots}/{r.total_slots} slots</span>
                  </div>
                  <PctBar pct={r.occupancy_rate * 100} color={r.occupancy_rate > 0.8 ? "bg-emerald-500" : r.occupancy_rate > 0.5 ? "bg-brand-500" : "bg-amber-500"} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="font-bold mb-4 flex items-center gap-2"><CalendarX className="w-5 h-5 text-rose-500" /> {t("reports.cancellationRate")}</h2>
          {cancel.isLoading ? <Spinner /> : cancel.data && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2 py-4">
                <div className={`text-5xl font-extrabold ${cancel.data.cancellation_rate > 0.2 ? "text-rose-600" : cancel.data.cancellation_rate > 0.1 ? "text-amber-600" : "text-emerald-600"}`}>
                  {(cancel.data.cancellation_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-ink-500">{t("reports.absenceRate")}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center border-t border-ink-100 pt-4">
                <div><div className="text-xl font-bold text-ink-800">{cancel.data.total}</div><div className="text-xs text-ink-400">{t("reports.total")}</div></div>
                <div><div className="text-xl font-bold text-rose-600">{cancel.data.cancelled}</div><div className="text-xs text-ink-400">{t("reports.cancelled")}</div></div>
                <div><div className="text-xl font-bold text-amber-600">{cancel.data.no_show}</div><div className="text-xs text-ink-400">{t("reports.noShow")}</div></div>
              </div>
            </div>
          )}
        </section>
      </div>

      {isAdmin && (
        <section className="card">
          <h2 className="font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600" /> {t("reports.revenue")}</h2>
          {revenue.isLoading ? <Spinner /> : revenue.data && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col justify-center items-center p-6 rounded-2xl bg-emerald-50 border border-emerald-100 min-w-[180px]">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{t("reports.total")}</div>
                <div className="text-4xl font-extrabold text-emerald-700">$ {Number(revenue.data.total_revenue).toFixed(2)}</div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-sm font-semibold text-ink-700 mb-2">{t("reports.byDoctor")}</div>
                {Object.entries((revenue.data.by_doctor ?? {}) as Record<string, number>).map(([name, val]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[220px]">{name}</span>
                      <span className="font-bold text-emerald-700">$ {Number(val).toFixed(2)}</span>
                    </div>
                    <Bar value={Number(val)} max={maxRev} color="bg-emerald-500" />
                  </div>
                ))}
                {Object.keys(revenue.data.by_doctor ?? {}).length === 0 && (
                  <div className="text-ink-400 text-sm">{t("reports.noRevenue")}</div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
