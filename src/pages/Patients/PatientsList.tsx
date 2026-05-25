import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { listPatients, createPatient, updatePatient, deletePatient } from "../../services/patients";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";
import type { Patient } from "../../types";

const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

type F = { email: string; full_name: string; phone: string; password: string; dni: string; birth_date: string; blood_type: string; allergies: string; notes: string; };
const blank: F = { email: "", full_name: "", phone: "", password: "", dni: "", birth_date: "", blood_type: "", allergies: "", notes: "" };

export default function PatientsList() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const canCreate = role === "admin" || role === "receptionist";
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [form, setForm] = useState<F>(blank);
  const [err, setErr] = useState<string | null>(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", q],
    queryFn: () => listPatients(q || undefined),
  });

  const save = useMutation({
    mutationFn: () => editing
      ? updatePatient(editing.id, { full_name: form.full_name, phone: form.phone||undefined, dni: form.dni||undefined, birth_date: form.birth_date||undefined, blood_type: form.blood_type||undefined, allergies: form.allergies||undefined, notes: form.notes||undefined })
      : createPatient({ email: form.email, full_name: form.full_name, phone: form.phone||undefined, password: form.password, dni: form.dni||undefined, birth_date: form.birth_date||undefined, blood_type: form.blood_type||undefined, allergies: form.allergies||undefined, notes: form.notes||undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients"] }); setModalOpen(false); setEditing(null); setForm(blank); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const del = useMutation({
    mutationFn: () => deletePatient(deleting!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients"] }); setDeleting(null); },
  });

  function openCreate() { setForm(blank); setErr(null); setEditing(null); setModalOpen(true); }
  function openEdit(p: Patient) {
    setForm({ email: p.email, full_name: p.full_name, phone: p.phone??"", password: "", dni: p.dni??"", birth_date: p.birth_date??"", blood_type: p.blood_type??"", allergies: p.allergies??"", notes: p.notes??"" });
    setErr(null); setEditing(p); setModalOpen(true);
  }
  const f = (k: keyof F) => (e: React.ChangeEvent<any>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("patients.title")}</h1>
          <p className="text-sm text-ink-500">{patients.length} {t("patients.registered")}</p>
        </div>
        {canCreate && <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> {t("patients.new")}</button>}
      </header>

      <div className="card flex gap-3 items-center">
        <Search className="w-4 h-4 text-ink-400" />
        <input className="input border-0 shadow-none p-0 flex-1" placeholder={t("patients.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? <Spinner /> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">{t("patients.name")}</th>
                <th className="text-left px-4 py-3">{t("patients.dni")}</th>
                <th className="text-left px-4 py-3">{t("auth.email")}</th>
                <th className="text-left px-4 py-3">{t("patients.phone")}</th>
                <th className="text-left px-4 py-3">{t("patients.blood")}</th>
                <th className="text-left px-4 py-3">{t("patients.dob")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/50 group">
                  <td className="px-4 py-3 font-semibold">{p.full_name}</td>
                  <td className="px-4 py-3 text-ink-600">{p.dni ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{p.email}</td>
                  <td className="px-4 py-3 text-ink-600">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{p.blood_type ? <span className="badge-rose">{p.blood_type}</span> : "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{p.birth_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                      <Link to={`/patients/${p.id}`} className="btn-ghost btn-sm p-1.5"><ChevronRight className="w-3.5 h-3.5" /></Link>
                      {canCreate && <button className="btn-ghost btn-sm p-1.5" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></button>}
                      {role === "admin" && <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => setDeleting(p)}><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-ink-400">{t("patients.noResults")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `${t("patients.editTitle")}: ${editing.full_name}` : t("patients.new")} size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">{t("patients.fullName")} *</label><input className="input" value={form.full_name} onChange={f("full_name")} /></div>
          <div><label className="label">{t("auth.email")} *</label><input className="input" type="email" value={form.email} onChange={f("email")} disabled={!!editing} /></div>
          {!editing && <div><label className="label">{t("patients.password")} *</label><input className="input" type="password" value={form.password} onChange={f("password")} placeholder={t("patients.passwordPh")} /></div>}
          <div><label className="label">{t("patients.phone")}</label><input className="input" value={form.phone} onChange={f("phone")} /></div>
          <div><label className="label">{t("patients.dni")}</label><input className="input" value={form.dni} onChange={f("dni")} /></div>
          <div><label className="label">{t("patients.dobLabel")}</label><input className="input" type="date" value={form.birth_date} onChange={f("birth_date")} /></div>
          <div><label className="label">{t("patients.bloodType")}</label>
            <select className="select" value={form.blood_type} onChange={f("blood_type")}>
              <option value="">{t("patients.notSpecified")}</option>
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">{t("patients.allergies")}</label><input className="input" value={form.allergies} onChange={f("allergies")} placeholder={t("patients.allergiesPh")} /></div>
          <div className="sm:col-span-2"><label className="label">{t("patients.clinicalNotes")}</label><textarea className="input" rows={2} value={form.notes} onChange={f("notes")} placeholder={t("patients.clinicalNotesPh")} /></div>
          {err && <div className="sm:col-span-2 text-sm text-rose-600">{err}</div>}
          <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setEditing(null); }}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={save.isPending || !form.full_name} onClick={() => save.mutate()}>
              {save.isPending ? t("patients.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} danger title={t("patients.deleteTitle")}
        message={`${deleting?.full_name}`}
        onConfirm={() => del.mutate()} onClose={() => setDeleting(null)} />
    </div>
  );
}
