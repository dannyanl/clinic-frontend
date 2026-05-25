import { format, parseISO } from "date-fns";

export function fmtDate(iso: string, pattern = "dd/MM/yyyy HH:mm"): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function statusLabel(status: string): string {
  return ({
    pending: "Pendiente",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    completed: "Completado",
    no_show: "No asistió",
    checked_in: "En sala",
  } as Record<string, string>)[status] ?? status;
}

export function statusColor(status: string): string {
  return ({
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
    completed: "bg-sky-100 text-sky-800",
    no_show: "bg-slate-200 text-slate-700",
    checked_in: "bg-violet-100 text-violet-800",
  } as Record<string, string>)[status] ?? "bg-slate-100 text-slate-700";
}
