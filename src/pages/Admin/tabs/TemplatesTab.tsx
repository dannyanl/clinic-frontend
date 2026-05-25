import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, Trash2, Edit3, CheckCircle, MessageSquare } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, type MessageTemplate } from "../../../services/templates";

const CHANNELS = [
  { value: "email", label: "Email", icon: "✉️" },
  { value: "sms", label: "SMS", icon: "💬" },
  { value: "whatsapp", label: "WhatsApp", icon: "📱" },
];

const EVENTS = [
  "appointment_confirmed", "appointment_reminder", "appointment_cancelled",
  "appointment_completed", "payment_received", "welcome", "custom"
];

const EVENT_LABELS: Record<string, string> = {
  appointment_confirmed: "Turno confirmado",
  appointment_reminder: "Recordatorio de turno",
  appointment_cancelled: "Turno cancelado",
  appointment_completed: "Turno completado",
  payment_received: "Pago recibido",
  welcome: "Bienvenida",
  custom: "Personalizado",
};

export default function TemplatesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState({ name: "", channel: "email", event: "appointment_confirmed", subject: "", body: "" });
  const [err, setErr] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({ queryKey: ["templates"], queryFn: listTemplates });

  const save = useMutation({
    mutationFn: () => editing
      ? updateTemplate(editing.id, { name: form.name, subject: form.subject, body: form.body, channel: form.channel as any, event: form.event, is_active: true })
      : createTemplate({ name: form.name, channel: form.channel, event: form.event, subject: form.subject || undefined, body: form.body }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); setModal(false); setEditing(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al guardar"),
  });

  const del = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  function openCreate() {
    setForm({ name: "", channel: "email", event: "appointment_confirmed", subject: "", body: "" });
    setEditing(null); setErr(null); setModal(true);
  }

  function openEdit(t: MessageTemplate) {
    setForm({ name: t.name, channel: t.channel, event: t.event, subject: t.subject ?? "", body: t.body });
    setEditing(t); setErr(null); setModal(true);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" /> Plantillas de mensajes
          </h2>
          <p className="text-sm text-ink-500">Templates de email, SMS y WhatsApp enviados automáticamente.</p>
        </div>
        <button className="btn-gradient" onClick={openCreate}><Plus className="w-4 h-4" /> Nueva plantilla</button>
      </div>

      {isLoading ? <Spinner /> : templates.length === 0 ? (
        <div className="card text-ink-500 text-sm text-center py-8">Sin plantillas configuradas. Creá la primera.</div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card flex items-start gap-4">
              <div className="text-2xl">{CHANNELS.find(c => c.value === t.channel)?.icon ?? "✉️"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{t.name}</span>
                  <span className="badge-blue text-xs">{CHANNELS.find(c => c.value === t.channel)?.label ?? t.channel}</span>
                  <span className="badge-slate text-xs">{EVENT_LABELS[t.event] ?? t.event}</span>
                  {!t.is_active && <span className="badge-rose text-xs">Inactivo</span>}
                </div>
                {t.subject && <div className="text-sm text-ink-600 mt-1">Asunto: {t.subject}</div>}
                <div className="text-xs text-ink-400 mt-1 truncate">{t.body.slice(0, 120)}{t.body.length > 120 ? "…" : ""}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-secondary btn-sm" onClick={() => openEdit(t)}>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => {
                  if (confirm(`¿Eliminar la plantilla "${t.name}"?`)) del.mutate(t.id);
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar plantilla" : "Nueva plantilla"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre de la plantilla *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Recordatorio 24h" />
            </div>
            <div>
              <label className="label">Canal</label>
              <select className="select" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Evento</label>
              <select className="select" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}>
                {EVENTS.map(e => <option key={e} value={e}>{EVENT_LABELS[e]}</option>)}
              </select>
            </div>
            {form.channel === "email" && (
              <div className="col-span-2">
                <label className="label">Asunto del email</label>
                <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Recordatorio: tu turno es mañana" />
              </div>
            )}
            <div className="col-span-2">
              <label className="label">Cuerpo del mensaje *</label>
              <textarea className="input font-mono text-sm" rows={6} value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Hola {{patient_name}}, te recordamos tu turno con {{doctor_name}} el {{date}} a las {{time}}." />
              <p className="text-xs text-ink-400 mt-1">Variables disponibles: {"{{patient_name}}, {{doctor_name}}, {{date}}, {{time}}, {{clinic_name}}"}</p>
            </div>
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.body}>
              {save.isPending ? "Guardando…" : <><CheckCircle className="w-4 h-4" /> {editing ? "Actualizar" : "Crear plantilla"}</>}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
