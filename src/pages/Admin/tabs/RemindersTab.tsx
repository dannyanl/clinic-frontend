import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2, CheckCircle } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import { listReminderPolicies, createReminderPolicy, deleteReminderPolicy } from "../../../services/reminders";

const CHANNELS = [
  { value: "email", label: "Email", icon: "✉️" },
  { value: "sms", label: "SMS", icon: "💬" },
  { value: "whatsapp", label: "WhatsApp", icon: "📱" },
  { value: "push", label: "Push", icon: "🔔" },
];

export default function RemindersTab() {
  const qc = useQueryClient();
  const [hours, setHours] = useState(24);
  const [channel, setChannel] = useState("email");
  const [err, setErr] = useState<string | null>(null);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["reminder-policies"],
    queryFn: listReminderPolicies,
  });

  const create = useMutation({
    mutationFn: () => createReminderPolicy({ hours_before: hours, channel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminder-policies"] }); setErr(null); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? "Error al crear"),
  });

  const del = useMutation({
    mutationFn: deleteReminderPolicy,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder-policies"] }),
  });

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" /> Políticas de recordatorios
        </h2>
        <p className="text-sm text-ink-500">Define cuándo y cómo se envían los recordatorios automáticos de turnos.</p>
      </div>

      {/* Create form */}
      <div className="card max-w-lg space-y-4 mb-6">
        <h3 className="font-bold text-ink-800">Agregar política de recordatorio</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Horas antes del turno</label>
            <input
              className="input"
              type="number"
              min={1}
              max={168}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
            <p className="text-xs text-ink-400 mt-1">Ej: 24 = 1 día antes; 48 = 2 días antes</p>
          </div>
          <div>
            <label className="label">Canal</label>
            <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
              {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        </div>
        {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
        <button className="btn-primary" onClick={() => create.mutate()} disabled={create.isPending}>
          {create.isPending ? "Agregando…" : <><Plus className="w-4 h-4" /> Agregar política</>}
        </button>
      </div>

      {/* Policy list */}
      <div className="max-w-lg">
        <h3 className="font-bold mb-3 text-ink-700">Políticas activas</h3>
        {isLoading ? <Spinner /> : policies.length === 0 ? (
          <div className="card text-ink-500 text-sm text-center py-6">
            Sin políticas configuradas. Los pacientes no recibirán recordatorios automáticos.
          </div>
        ) : (
          <div className="space-y-2">
            {policies.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-50 border border-ink-200">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{CHANNELS.find(c => c.value === p.channel)?.icon ?? "🔔"}</div>
                  <div>
                    <div className="font-semibold">
                      {p.hours_before}h antes · {CHANNELS.find(c => c.value === p.channel)?.label ?? p.channel}
                    </div>
                    <div className="text-xs text-ink-400">
                      {p.hours_before >= 24 ? `${p.hours_before / 24} día(s) antes del turno` : `${p.hours_before} hora(s) antes del turno`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_active && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => {
                    if (confirm("¿Eliminar esta política?")) del.mutate(p.id);
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
