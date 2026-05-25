import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Spinner } from "../../../components/ui/Spinner";
import { listSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from "../../../services/admin";
import type { Specialty } from "../../../types";

export default function SpecialtiesTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["specialties"], queryFn: listSpecialties });
  const [modal, setModal] = useState<false | "create" | Specialty>(false);
  const [deleting, setDeleting] = useState<Specialty | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      modal === "create"
        ? createSpecialty(form)
        : updateSpecialty((modal as Specialty).id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["specialties"] }); setModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error"),
  });

  const del = useMutation({
    mutationFn: () => deleteSpecialty(deleting!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["specialties"] }); setDeleting(null); },
  });

  function openCreate() { setForm({ name: "", description: "" }); setErr(null); setModal("create"); }
  function openEdit(s: Specialty) { setForm({ name: s.name, description: s.description ?? "" }); setErr(null); setModal(s); }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Especialidades médicas</h2>
          <p className="text-sm text-ink-500">{data.length} especialidades registradas</p>
        </div>
        <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva especialidad</button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => (
            <div key={s.id} className="card flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-ink-900">{s.name}</div>
                  {s.description && <div className="text-sm text-ink-500 mt-0.5">{s.description}</div>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button className="btn-ghost btn-sm p-1.5" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></button>
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => setDeleting(s)}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="text-ink-500 text-sm">Sin especialidades. Creá la primera.</div>}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(false)} title={modal === "create" ? "Nueva especialidad" : "Editar especialidad"}>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cardiología" />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción opcional..." />
          </div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-primary" disabled={!form.name || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting} danger
        title="Eliminar especialidad"
        message={`¿Eliminás "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => del.mutate()}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
