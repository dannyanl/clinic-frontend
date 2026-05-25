import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { Spinner } from "../../../components/ui/Spinner";
import { listLocations, createLocation, updateLocation, deleteLocation, type Location } from "../../../services/admin";

type F = { name: string; address: string; phone: string };

export default function LocationsTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["locations"], queryFn: listLocations });
  const [modal, setModal] = useState<false | "create" | Location>(false);
  const [deleting, setDeleting] = useState<Location | null>(null);
  const [form, setForm] = useState<F>({ name: "", address: "", phone: "" });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      modal === "create"
        ? createLocation(form)
        : updateLocation((modal as Location).id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locations"] }); setModal(false); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error"),
  });

  const del = useMutation({
    mutationFn: () => deleteLocation(deleting!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["locations"] }); setDeleting(null); },
  });

  function openCreate() { setForm({ name: "", address: "", phone: "" }); setErr(null); setModal("create"); }
  function openEdit(l: Location) { setForm({ name: l.name, address: l.address ?? "", phone: l.phone ?? "" }); setErr(null); setModal(l); }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Sedes y consultorios</h2>
          <p className="text-sm text-ink-500">{data.length} sedes registradas</p>
        </div>
        <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva sede</button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((l) => (
            <div key={l.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <div className="font-bold">{l.name}</div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost btn-sm p-1.5" onClick={() => openEdit(l)}><Pencil className="w-3.5 h-3.5" /></button>
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => setDeleting(l)}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {l.address && <div className="text-sm text-ink-500 mt-1">{l.address}</div>}
              {l.phone && <div className="text-sm text-ink-500">{l.phone}</div>}
            </div>
          ))}
          {data.length === 0 && <div className="text-ink-500 text-sm">Sin sedes registradas.</div>}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(false)} title={modal === "create" ? "Nueva sede" : "Editar sede"}>
        <div className="space-y-4">
          {(["name", "address", "phone"] as const).map((k) => (
            <div key={k}>
              <label className="label">{k === "name" ? "Nombre" : k === "address" ? "Dirección" : "Teléfono"}</label>
              <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={k === "name" ? "Consultorio Central" : k === "address" ? "Av. Corrientes 1234, CABA" : "+54 11 4444-5555"} />
            </div>
          ))}
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-primary" disabled={!form.name || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleting} danger title="Eliminar sede"
        message={`¿Eliminás "${deleting?.name}"?`}
        onConfirm={() => del.mutate()} onClose={() => setDeleting(null)} />
    </>
  );
}
