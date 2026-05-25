import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { listDoctors, listSpecialties, createDoctor, updateDoctor, deleteDoctor } from "../../services/doctors";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";
import type { Doctor } from "../../types";

type F = { email: string; full_name: string; phone: string; password: string; specialty_id: string; license_number: string; bio: string; consultation_fee: string; };
const blank: F = { email: "", full_name: "", phone: "", password: "", specialty_id: "", license_number: "", bio: "", consultation_fee: "0" };

export default function DoctorsList() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [spId, setSpId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const [form, setForm] = useState<F>(blank);
  const [err, setErr] = useState<string | null>(null);

  const { data: specialties = [] } = useQuery({ queryKey: ["specialties"], queryFn: listSpecialties });
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors", q, spId],
    queryFn: () => listDoctors({ q: q || undefined, specialty_id: spId ? Number(spId) : undefined }),
  });

  const save = useMutation({
    mutationFn: () => editing
      ? updateDoctor(editing.id, { full_name: form.full_name, phone: form.phone || undefined, bio: form.bio || undefined, consultation_fee: Number(form.consultation_fee), specialty_id: Number(form.specialty_id) })
      : createDoctor({ email: form.email, full_name: form.full_name, phone: form.phone || undefined, password: form.password, specialty_id: Number(form.specialty_id), license_number: form.license_number, bio: form.bio || undefined, consultation_fee: Number(form.consultation_fee) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); setModalOpen(false); setEditing(null); setForm(blank); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const del = useMutation({
    mutationFn: () => deleteDoctor(deleting!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); setDeleting(null); },
  });

  function openCreate() { setForm(blank); setErr(null); setEditing(null); setModalOpen(true); }
  function openEdit(d: Doctor) {
    setForm({ email: d.email, full_name: d.full_name, phone: d.phone ?? "", password: "", specialty_id: String(d.specialty.id), license_number: d.license_number, bio: d.bio ?? "", consultation_fee: String(d.consultation_fee) });
    setErr(null); setEditing(d); setModalOpen(true);
  }
  const f = (k: keyof F) => (e: React.ChangeEvent<any>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("doctors.title")}</h1>
          <p className="text-sm text-ink-500">{t("doctors.subtitle")}</p>
        </div>
        {isAdmin && <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> {t("doctors.add")}</button>}
      </header>

      <div className="card flex flex-col sm:flex-row gap-3">
        <input className="input sm:max-w-xs" placeholder={t("doctors.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select sm:max-w-xs" value={spId} onChange={(e) => setSpId(e.target.value)}>
          <option value="">{t("doctors.allSpecialties")}</option>
          {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading && <Spinner />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((d) => (
          <div key={d.id} className="card flex flex-col gap-3 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-gradient grid place-items-center text-white font-bold text-lg shadow">
                  {d.full_name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-bold">{d.full_name}</div>
                  <div className="text-sm text-brand-600">{d.specialty.name}</div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button className="btn-ghost btn-sm p-1.5" onClick={() => openEdit(d)}><Pencil className="w-3.5 h-3.5" /></button>
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => setDeleting(d)}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
            {d.bio && <p className="text-sm text-ink-600 line-clamp-2">{d.bio}</p>}
            <div className="flex items-center justify-between text-sm border-t border-ink-100 pt-2">
              <span className="font-semibold">$ {Number(d.consultation_fee).toFixed(2)} {t("doctors.fee")}</span>
              <span className="text-xs text-ink-400">{t("doctors.license")}: {d.license_number}</span>
            </div>
            <Link to={`/doctors/${d.id}`} className="btn-secondary btn-sm justify-center">{t("doctors.viewProfile")} <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
        ))}
        {!isLoading && doctors.length === 0 && <div className="col-span-3 text-ink-500 text-sm">{t("doctors.noDoctors")}</div>}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `${t("doctors.editTitle")}: ${editing.full_name}` : t("doctors.add")} size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">{t("patients.fullName")} *</label><input className="input" value={form.full_name} onChange={f("full_name")} /></div>
          <div><label className="label">{t("auth.email")} *</label><input className="input" type="email" value={form.email} onChange={f("email")} disabled={!!editing} /></div>
          {!editing && <div><label className="label">{t("patients.password")} *</label><input className="input" type="password" value={form.password} onChange={f("password")} placeholder={t("patients.passwordPh")} /></div>}
          <div><label className="label">{t("patients.phone")}</label><input className="input" value={form.phone} onChange={f("phone")} /></div>
          <div><label className="label">{t("doctors.specialty")} *</label>
            <select className="select" value={form.specialty_id} onChange={f("specialty_id")}>
              <option value="">{t("insurance.selectProvider")}</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t("doctors.license")} *</label><input className="input" value={form.license_number} onChange={f("license_number")} placeholder={t("doctors.licensePh")} /></div>
          <div><label className="label">{t("doctors.fee_label")}</label><input className="input" type="number" min="0" value={form.consultation_fee} onChange={f("consultation_fee")} /></div>
          <div className="sm:col-span-2"><label className="label">{t("doctors.bio")}</label><textarea className="input" rows={3} value={form.bio} onChange={f("bio")} placeholder={t("doctors.bioPh")} /></div>
          {err && <div className="sm:col-span-2 text-sm text-rose-600">{err}</div>}
          <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setEditing(null); }}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={save.isPending || !form.full_name || !form.specialty_id} onClick={() => save.mutate()}>
              {save.isPending ? t("doctors.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} danger title={t("doctors.deleteTitle")}
        message={t("doctors.deleteMsg", { name: deleting?.full_name ?? "" })}
        onConfirm={() => del.mutate()} onClose={() => setDeleting(null)} />
    </div>
  );
}
