import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw, User, Calendar } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import {
  listTrashedPatients, restorePatient,
  listTrashedAppointments, restoreAppointment,
} from "../../../services/trash";
import { fmtDate } from "../../../utils/format";

export default function TrashTab() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"patients" | "appointments">("patients");

  const patients = useQuery({ queryKey: ["trash-patients"], queryFn: listTrashedPatients });
  const appointments = useQuery({ queryKey: ["trash-appointments"], queryFn: listTrashedAppointments });

  const restorePat = useMutation({
    mutationFn: restorePatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trash-patients"] }),
    onError: (e: any) => alert(e?.response?.data?.detail || "Error al restaurar"),
  });

  const restoreAppt = useMutation({
    mutationFn: restoreAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trash-appointments"] }),
    onError: (e: any) => alert(e?.response?.data?.detail || "Error al restaurar"),
  });

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" /> Papelera
        </h2>
        <p className="text-sm text-ink-500">Registros eliminados (soft-delete). Podés restaurarlos antes de que sean eliminados permanentemente.</p>
      </div>

      <div className="flex gap-1 mb-5 bg-ink-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("patients")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "patients" ? "bg-white shadow-sm text-rose-700" : "text-ink-600 hover:text-ink-900"}`}>
          <User className="w-4 h-4" /> Pacientes ({patients.data?.length ?? 0})
        </button>
        <button onClick={() => setTab("appointments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "appointments" ? "bg-white shadow-sm text-rose-700" : "text-ink-600 hover:text-ink-900"}`}>
          <Calendar className="w-4 h-4" /> Turnos ({appointments.data?.length ?? 0})
        </button>
      </div>

      {tab === "patients" && (
        <>
          {patients.isLoading ? <Spinner /> : (patients.data ?? []).length === 0 ? (
            <div className="card text-ink-500 text-sm text-center py-8">No hay pacientes en la papelera.</div>
          ) : (
            <div className="space-y-2">
              {(patients.data ?? []).map((p) => (
                <div key={p.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 grid place-items-center text-rose-600 flex-shrink-0 font-bold">
                    {p.full_name.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.full_name}</div>
                    <div className="text-sm text-ink-500">{p.email}</div>
                    <div className="text-xs text-rose-500">Eliminado: {new Date(p.deleted_at).toLocaleString()}</div>
                  </div>
                  <button
                    className="btn-secondary btn-sm flex items-center gap-1.5"
                    onClick={() => restorePat.mutate(p.id)}
                    disabled={restorePat.isPending}>
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "appointments" && (
        <>
          {appointments.isLoading ? <Spinner /> : (appointments.data ?? []).length === 0 ? (
            <div className="card text-ink-500 text-sm text-center py-8">No hay turnos en la papelera.</div>
          ) : (
            <div className="space-y-2">
              {(appointments.data ?? []).map((a) => (
                <div key={a.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 grid place-items-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{a.patient_name} → {a.doctor_name}</div>
                    <div className="text-sm text-ink-500">{fmtDate(a.starts_at)}</div>
                    <div className="text-xs text-rose-500">Eliminado: {new Date(a.deleted_at).toLocaleString()}</div>
                  </div>
                  <button
                    className="btn-secondary btn-sm flex items-center gap-1.5"
                    onClick={() => restoreAppt.mutate(a.id)}
                    disabled={restoreAppt.isPending}>
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
