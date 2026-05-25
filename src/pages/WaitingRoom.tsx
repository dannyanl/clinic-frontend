import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Trash2, UserCheck, CalendarClock } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import { getTodayWaitingRoom, listWaitingList, joinWaitingList, removeFromWaitingList } from "../services/waitingRoom";
import { listSpecialties } from "../services/doctors";
import { fmtDate, statusColor, statusLabel } from "../utils/format";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

export default function WaitingRoom() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const isPatient = role === "patient";
  const canSeeRoom = role === "admin" || role === "doctor" || role === "receptionist";
  const qc = useQueryClient();

  const [joinModal, setJoinModal] = useState(false);
  const [form, setForm] = useState({ specialty_id: "", preferred_date: "", notes: "" });

  const today = useQuery({
    queryKey: ["waiting-room-today"],
    queryFn: () => getTodayWaitingRoom(),
    enabled: canSeeRoom,
    refetchInterval: 30_000,
  });

  const waitList = useQuery({
    queryKey: ["waiting-list"],
    queryFn: listWaitingList,
    enabled: canSeeRoom,
  });

  const specialties = useQuery({ queryKey: ["specialties"], queryFn: listSpecialties });

  const join = useMutation({
    mutationFn: () => joinWaitingList({
      specialty_id: form.specialty_id ? Number(form.specialty_id) : undefined,
      preferred_date: form.preferred_date || undefined,
      notes: form.notes || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["waiting-list"] }); setJoinModal(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => removeFromWaitingList(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["waiting-list"] }),
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("waitingRoom.title")}</h1>
          <p className="text-sm text-ink-500">{t("waitingRoom.subtitle")}</p>
        </div>
        {isPatient && (
          <button className="btn-gradient" onClick={() => setJoinModal(true)}>
            <Plus className="w-4 h-4" /> {t("waitingRoom.joinBtn")}
          </button>
        )}
      </header>

      {canSeeRoom && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" /> {t("waitingRoom.todayAppts")}
            <span className="ml-auto text-xs text-ink-400 font-normal">{t("waitingRoom.refreshNote")}</span>
          </h2>
          {today.isLoading ? <Spinner /> : (today.data ?? []).length === 0 ? (
            <div className="text-ink-500 text-sm">{t("waitingRoom.noToday")}</div>
          ) : (
            <div className="space-y-2">
              {(today.data ?? []).map((e) => (
                <div key={e.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/50 group">
                  <div className="w-10 h-10 rounded-full bg-brand-100 grid place-items-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-3 gap-1">
                    <span className="font-semibold">{fmtDate(e.starts_at, "HH:mm")}</span>
                    <span className="text-ink-700">{e.patient ?? "—"}</span>
                    <span className="text-ink-500 text-sm">{e.doctor ?? "—"}</span>
                  </div>
                  <span className={`badge ${statusColor(e.status)}`}>{statusLabel(e.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {canSeeRoom && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-accent-600" /> {t("waitingRoom.waitingList")}
          </h2>
          {waitList.isLoading ? <Spinner /> : (waitList.data ?? []).length === 0 ? (
            <div className="text-ink-500 text-sm">{t("waitingRoom.noWaiting")}</div>
          ) : (
            <div className="space-y-2">
              {(waitList.data ?? []).map((e) => (
                <div key={e.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 group">
                  <div className="flex-1 grid sm:grid-cols-3 gap-1 text-sm">
                    <span className="font-semibold">#{e.patient_id}</span>
                    <span className="text-ink-600">{e.preferred_date ?? t("waitingRoom.noDate")}</span>
                    <span className="text-ink-500 italic">{e.notes ?? "—"}</span>
                  </div>
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => remove.mutate(e.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isPatient && (
        <div className="card bg-brand-50 border-brand-200">
          <h2 className="font-bold text-brand-800 mb-2">{t("waitingRoom.urgentCard.title")}</h2>
          <p className="text-sm text-brand-700 mb-3">{t("waitingRoom.urgentCard.body")}</p>
          <button className="btn-primary btn-sm" onClick={() => setJoinModal(true)}>{t("waitingRoom.joinBtn")}</button>
        </div>
      )}

      <Modal open={joinModal} onClose={() => setJoinModal(false)} title={t("waitingRoom.modal.title")} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{t("waitingRoom.specialty")}</label>
            <select className="select" value={form.specialty_id} onChange={(e) => setForm({ ...form, specialty_id: e.target.value })}>
              <option value="">{t("waitingRoom.anySpecialty")}</option>
              {(specialties.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("waitingRoom.preferredDate")}</label>
            <input className="input" type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("waitingRoom.notes")}</label>
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("waitingRoom.notesPh")} />
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setJoinModal(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={() => join.mutate()} disabled={join.isPending}>
              {join.isPending ? t("waitingRoom.joining") : t("waitingRoom.join")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
