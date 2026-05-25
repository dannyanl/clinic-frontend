import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck, Plus, Edit3, Trash2, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";
import {
  listConsentTemplates, createConsentTemplate, updateConsentTemplate, deleteConsentTemplate,
  type ConsentTemplate,
} from "../../../services/consents";

export default function ConsentTemplatesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ConsentTemplate | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [err, setErr] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["consent-templates"],
    queryFn: listConsentTemplates,
  });

  const save = useMutation({
    mutationFn: () => editing
      ? updateConsentTemplate(editing.id, { title: form.title, content: form.content })
      : createConsentTemplate({ title: form.title, content: form.content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["consent-templates"] }); setModal(false); setEditing(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al guardar"),
  });

  const toggle = useMutation({
    mutationFn: (t: ConsentTemplate) => updateConsentTemplate(t.id, { is_active: !t.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consent-templates"] }),
  });

  const del = useMutation({
    mutationFn: deleteConsentTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consent-templates"] }),
  });

  function openCreate() {
    setForm({ title: "", content: "" });
    setEditing(null); setErr(null); setModal(true);
  }

  function openEdit(t: ConsentTemplate) {
    setForm({ title: t.title, content: t.content });
    setEditing(t); setErr(null); setModal(true);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-600" /> Plantillas de consentimiento
          </h2>
          <p className="text-sm text-ink-500">Formularios de consentimiento informado que los pacientes firman antes de atenderse.</p>
        </div>
        <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva plantilla</button>
      </div>

      {isLoading ? <Spinner /> : templates.length === 0 ? (
        <div className="card text-ink-500 text-sm text-center py-8">Sin plantillas configuradas. Creá la primera.</div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${t.is_active ? "bg-brand-100" : "bg-ink-100"}`}>
                <FileCheck className={`w-5 h-5 ${t.is_active ? "text-brand-600" : "text-ink-400"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{t.title}</span>
                  {t.is_active
                    ? <span className="badge-green text-xs">Activo</span>
                    : <span className="badge-slate text-xs">Inactivo</span>}
                </div>
                <div className="text-sm text-ink-500 mt-1 line-clamp-2">{t.content.slice(0, 150)}{t.content.length > 150 ? "…" : ""}</div>
                <div className="text-xs text-ink-400 mt-1">{new Date(t.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost btn-sm p-1.5" title={t.is_active ? "Desactivar" : "Activar"} onClick={() => toggle.mutate(t)}>
                  {t.is_active
                    ? <ToggleRight className="w-5 h-5 text-brand-600" />
                    : <ToggleLeft className="w-5 h-5 text-ink-400" />}
                </button>
                <button className="btn-secondary btn-sm" onClick={() => openEdit(t)}>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => {
                  if (confirm(`¿Eliminar la plantilla "${t.title}"?`)) del.mutate(t.id);
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar plantilla" : "Nueva plantilla de consentimiento"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Título del consentimiento *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Consentimiento informado general" />
          </div>
          <div>
            <label className="label">Texto completo del consentimiento *</label>
            <textarea className="input text-sm leading-relaxed" rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Yo, el/la paciente abajo firmante, declaro haber sido informado/a de manera clara y comprensible sobre...&#10;&#10;Fecha:&#10;Firma del paciente:&#10;Firma del profesional:" />
            <p className="text-xs text-ink-400 mt-1">{form.content.length} caracteres</p>
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.content}>
              {save.isPending ? "Guardando…" : <><CheckCircle className="w-4 h-4" /> {editing ? "Actualizar" : "Crear plantilla"}</>}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
