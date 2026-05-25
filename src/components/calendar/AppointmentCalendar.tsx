import { addDays, format, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";

import type { Appointment } from "../../types";
import { fmtDate, statusColor, statusLabel } from "../../utils/format";

interface Props {
  appointments: Appointment[];
}

export default function AppointmentCalendar({ appointments }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = format(new Date(a.starts_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-secondary text-sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
          ← Semana anterior
        </button>
        <div className="font-semibold">
          {format(weekStart, "dd MMM")} – {format(addDays(weekStart, 6), "dd MMM yyyy")}
        </div>
        <button className="btn-secondary text-sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Semana siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const items = byDay.get(key) ?? [];
          return (
            <div key={key} className="border border-slate-200 rounded-lg p-2 min-h-[140px] bg-slate-50">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                {format(day, "EEE dd")}
              </div>
              <div className="space-y-1">
                {items.length === 0 && <div className="text-[11px] text-slate-400">—</div>}
                {items.map((a) => (
                  <div key={a.id} className="bg-white rounded-md px-2 py-1 text-[11px] border border-slate-200">
                    <div className="font-medium">{fmtDate(a.starts_at, "HH:mm")}</div>
                    <div className="truncate">{a.doctor_name ?? a.patient_name}</div>
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded ${statusColor(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
