import { useEffect, useState } from "react";
import { CheckCircle, Palette } from "lucide-react";
import api from "../../../services/api";

interface Branding {
  name?: string;
  logo_url?: string;
  primary_color?: string;
  support_email?: string;
}

export default function BrandingTab() {
  const [form, setForm] = useState<Branding>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get<Branding>("/branding").then((r) => setForm(r.data)).catch(() => {});
  }, []);

  async function save() {
    setBusy(true); setErr(null);
    try {
      await api.put("/branding", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Error al guardar");
    } finally { setBusy(false); }
  }

  const field = (key: keyof Branding, label: string, placeholder?: string) => (
    <div key={key}>
      <label className="label">{label}</label>
      {key === "primary_color" ? (
        <div className="flex gap-3 items-center">
          <input type="color" value={form[key] ?? "#0ea5e9"}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-10 h-10 rounded-lg border border-ink-200 cursor-pointer" />
          <input className="input flex-1" value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
        </div>
      ) : (
        <input className="input" value={(form[key] as string) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
      )}
    </div>
  );

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Palette className="w-5 h-5 text-brand-600" /> Configuración de la clínica
        </h2>
        <p className="text-sm text-ink-500">Identidad visual y datos de contacto visibles en documentos y emails.</p>
      </div>
      <div className="card max-w-xl space-y-4">
        {field("name", "Nombre de la clínica", "Clínica Salud Plena")}
        {field("logo_url", "URL del logotipo", "https://…")}
        {field("primary_color", "Color principal (hex)", "#0ea5e9")}
        {field("support_email", "Email de soporte", "info@clinica.com")}
        {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" /> ¡Configuración guardada!
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </>
  );
}
