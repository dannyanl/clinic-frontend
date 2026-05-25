import { useQuery } from "@tanstack/react-query";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { enUS, es, pt, fr } from "date-fns/locale";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import { listAppointments } from "../services/appointments";
import { statusColor } from "../utils/format";
import { useI18n } from "../i18n";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07–19

const LOCALE_MAP: Record<string, Locale> = { es, en: enUS, pt, fr };

export default function Calendar() {
  const { t, lang } = useI18n();
  const locale = LOCALE_MAP[lang] ?? enUS;

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["appointments", "calendar-full"],
    queryFn: () => listAppointments(),
  });

  function byDayHour(day: Date, hour: number) {
    const key = format(day, "yyyy-MM-dd");
    return appts.filter((a) => {
      const d = new Date(a.starts_at);
      return format(d, "yyyy-MM-dd") === key && d.getHours() === hour;
    });
  }

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto animate-fade-in space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{t("calendar.title")}</h1>
          <p className="text-sm text-ink-500">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="btn-secondary btn-sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            {t("calendar.today")}
          </button>
          <button className="btn-secondary btn-sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold ml-2">
            {format(weekStart, "dd MMM", { locale })} – {format(addDays(weekStart, 6), "dd MMM yyyy", { locale })}
          </span>
          <Link to="/appointments/new" className="btn-gradient btn-sm ml-2">
            <Plus className="w-3.5 h-3.5" /> {t("calendar.newAppt")}
          </Link>
        </div>
      </div>

      {isLoading && <Spinner />}

      <div className="card p-0 overflow-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-200">
            <div className="px-2 py-3" />
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const isToday = key === today;
              return (
                <div key={key} className={`px-2 py-3 text-center border-l border-ink-100 ${isToday ? "bg-brand-50" : ""}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-brand-600" : "text-ink-500"}`}>
                    {format(d, "EEE", { locale })}
                  </div>
                  <div className={`text-lg font-extrabold mt-0.5 ${isToday ? "text-brand-700" : "text-ink-800"}`}>
                    {format(d, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {HOURS.map((h) => (
            <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-ink-100 min-h-[64px]">
              <div className="px-2 py-1 text-xs text-ink-400 font-mono text-right pr-3 pt-2">{h}:00</div>
              {days.map((d) => {
                const items = byDayHour(d, h);
                const isToday = format(d, "yyyy-MM-dd") === today;
                return (
                  <div key={format(d, "yyyy-MM-dd")} className={`border-l border-ink-100 p-1 ${isToday ? "bg-brand-50/30" : ""}`}>
                    {items.map((a) => (
                      <Link
                        key={a.id}
                        to="/appointments"
                        className={`block rounded-lg px-2 py-1 mb-1 text-xs font-medium border transition hover:shadow-sm ${
                          a.status === "cancelled" ? "bg-rose-50 border-rose-200 text-rose-700" :
                          a.status === "completed" ? "bg-sky-50 border-sky-200 text-sky-700" :
                          a.status === "confirmed" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                          "bg-amber-50 border-amber-200 text-amber-800"
                        }`}>
                        <div className="font-semibold truncate">{format(new Date(a.starts_at), "HH:mm")}</div>
                        <div className="truncate">{a.patient_name ?? a.doctor_name ?? "—"}</div>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
