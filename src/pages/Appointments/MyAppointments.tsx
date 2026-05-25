import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, CheckCircle, XCircle, Clock, AlertCircle, LogIn, CalendarDays, Video } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { cancelAppointment, checkInAppointment, listAppointments, updateAppointment } from "../../services/appointments";
import { fmtDate, statusColor, statusLabel } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { APPOINTMENT_TYPE_ICON, APPOINTMENT_TYPE_LABEL } from "../../types";

export default function MyAppointments() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "admin" || role === "doctor" || role === "receptionist";
  const canCheckIn = role === "admin" || role === "receptionist";
  const qc = useQueryClient();

  const [filter, setFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [notesId, setNotesId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const queryParams: Record<string, string | number> = {};
  if (filter) queryParams.status = filter;
  if (dateFrom) queryParams.from_date = dateFrom;
  if (dateTo) queryParams.to_date = dateTo;

  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments", "list", filter, dateFrom, dateTo],
    queryFn: () => listAppointments(Object.keys(queryParams).length ? queryParams : undefined),
  });

  const cancel = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateAppointment(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const checkIn = useMutation({
    mutationFn: checkInAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const saveNotes = useMutation({
    mutationFn: () => updateAppointment(notesId!, { notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); setNotesId(null); },
  });

  const STATUS_FILTERS = [
    { v: "", l: "Todos" }, { v: "pending", l: "Pendientes" }, { v: "confirmed", l: "Confirmados" },
    { v: "checked_in", l: "En sala" }, { v: "completed", l: "Completados" }, { v: "cancelled", l: "Cancelados" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Turnos</h1>
          <p className="text-sm text-ink-500">Listado y gestión de reservas</p>
        </div>
        <Link to="/appointments/new" className="btn-gradient flex-shrink-0">
          <Plus className="w-4 h-4" /> Reservar turno
        </Link>
      </header>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {STATUS_FILTERS.map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${filter === v ? "bg-brand-600 text-white shadow-sm" : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
              {l}
            </button>
          ))}
          <button onClick={() => setShowDateFilters(!showDateFilters)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${showDateFilters ? "bg-accent-600 text-white" : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
            <CalendarDays className="w-3.5 h-3.5" /> Fechas
          </button>
        </div>
        {showDateFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-ink-50 rounded-xl border border-ink-200">
            <div><label className="label">Desde</label><input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
            <div><label className="label">Hasta</label><input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
            {(dateFrom || dateTo) && (
              <div className="self-end pb-2">
                <button className="btn-ghost btn-sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>Limpiar</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading && <Spinner />}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Tipo / Fecha</th>
              <th className="text-left px-4 py-3">Doctor</th>
              <th className="text-left px-4 py-3">Paciente</th>
              <th className="text-left px-4 py-3">Motivo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{APPOINTMENT_TYPE_ICON[a.appointment_type] ?? "🩺"}</span>
                    <div>
                      <div className="font-medium text-xs text-brand-700">
                        {APPOINTMENT_TYPE_LABEL[a.appointment_type] ?? "Consulta"}
                      </div>
                      <div className="text-ink-800 font-semibold">{fmtDate(a.starts_at)}</div>
                      {a.is_telemedicine && (
                        <div className="text-xs text-sky-600 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Video
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{a.doctor_name ?? `#${a.doctor_id}`}</td>
                <td className="px-4 py-3">{a.patient_name ?? `#${a.patient_id}`}</td>
                <td className="px-4 py-3 text-ink-500 max-w-[120px] truncate">{a.reason ?? "—"}</td>
                <td className="px-4 py-3"><Badge className={statusColor(a.status)}>{statusLabel(a.status)}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {canCheckIn && a.status === "confirmed" && (
                      <button title="Check-in — marcar como en sala" className="btn-ghost btn-sm p-1.5" onClick={() => checkIn.mutate(a.id)}>
                        <LogIn className="w-4 h-4 text-violet-600" />
                      </button>
                    )}
                    {canManage && a.status !== "cancelled" && a.status !== "completed" && (
                      <>
                        {a.status === "pending" && (
                          <button title="Confirmar" className="btn-ghost btn-sm p-1.5" onClick={() => changeStatus.mutate({ id: a.id, status: "confirmed" })}>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}
                        {(a.status === "confirmed" || a.status === "checked_in") && (
                          <button title="Completar" className="btn-ghost btn-sm p-1.5" onClick={() => changeStatus.mutate({ id: a.id, status: "completed" })}>
                            <CheckCircle className="w-4 h-4 text-brand-600" />
                          </button>
                        )}
                        <button title="No asistió" className="btn-ghost btn-sm p-1.5" onClick={() => changeStatus.mutate({ id: a.id, status: "no_show" })}>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        </button>
                      </>
                    )}
                    {canManage && (
                      <button className="btn-secondary btn-sm" onClick={() => { setNotesId(a.id); setNotes(a.notes ?? ""); }}>
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {a.status !== "cancelled" && a.status !== "completed" && (
                      <button className="btn-danger btn-sm" onClick={() => cancel.mutate(a.id)}>
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="p-10 text-center text-ink-400">Sin turnos para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={notesId !== null} onClose={() => setNotesId(null)} title="Notas del turno" size="sm">
        <textarea className="input w-full" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones, indicaciones clínicas, etc." />
        <div className="flex gap-2 justify-end mt-4">
          <button className="btn-secondary" onClick={() => setNotesId(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => saveNotes.mutate()} disabled={saveNotes.isPending}>Guardar notas</button>
        </div>
      </Modal>
    </div>
  );
}
