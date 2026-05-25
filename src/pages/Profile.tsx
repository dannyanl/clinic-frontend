import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Lock, Phone, Mail, CheckCircle } from "lucide-react";

import { updateMe, changePassword } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState({ full_name: user?.full_name ?? "", phone: user?.phone ?? "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [profileOk, setProfileOk] = useState(false);
  const [pwdOk, setPwdOk] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  const saveProfile = useMutation({
    mutationFn: () => updateMe(user!.id, { full_name: profile.full_name, phone: profile.phone || undefined }),
    onSuccess: (u) => { setUser(u); setProfileOk(true); setProfileErr(null); setTimeout(() => setProfileOk(false), 3000); },
    onError: (e: any) => setProfileErr(e?.response?.data?.detail ?? "Error al guardar"),
  });

  const savePwd = useMutation({
    mutationFn: () => changePassword({ current_password: pwd.current, new_password: pwd.next }),
    onSuccess: () => { setPwdOk(true); setPwdErr(null); setPwd({ current: "", next: "", confirm: "" }); setTimeout(() => setPwdOk(false), 3000); },
    onError: (e: any) => setPwdErr(e?.response?.data?.detail ?? "Contraseña actual incorrecta"),
  });

  const pwdValid = pwd.next.length >= 8 && pwd.next === pwd.confirm && !!pwd.current;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Mi perfil</h1>
        <p className="text-sm text-ink-500">Gestioná tu información personal y contraseña</p>
      </header>

      {/* Avatar + info */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient grid place-items-center text-white font-extrabold text-2xl shadow-lg flex-shrink-0">
          {(user?.full_name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="font-extrabold text-lg">{user?.full_name}</div>
          <div className="text-sm text-ink-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</div>
          <div className="mt-1">
            <span className={`badge ${
              user?.role === "admin" ? "badge-violet" :
              user?.role === "doctor" ? "badge-blue" :
              user?.role === "receptionist" ? "badge-green" : "badge-slate"
            }`}>
              {({ admin: "Administrador", doctor: "Doctor", receptionist: "Recepcionista", patient: "Paciente" } as any)[user?.role ?? ""] ?? user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card space-y-5">
        <h2 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-brand-600" /> Información personal</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Teléfono</label>
            <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+54 11 5555-1234" />
          </div>
          <div className="sm:col-span-2">
            <label className="label flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
            <input className="input bg-ink-50 text-ink-400 cursor-not-allowed" value={user?.email ?? ""} disabled />
            <p className="text-xs text-ink-400 mt-1">El email no se puede modificar.</p>
          </div>
        </div>
        {profileErr && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{profileErr}</div>}
        {profileOk && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" /> Perfil actualizado correctamente.
          </div>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" disabled={saveProfile.isPending || !profile.full_name} onClick={() => saveProfile.mutate()}>
            {saveProfile.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Password form */}
      <div className="card space-y-5">
        <h2 className="text-lg font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-accent-600" /> Cambiar contraseña</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Contraseña actual</label>
            <input className="input" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} placeholder="Tu contraseña actual" />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input className="input" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="Mínimo 8 caracteres" />
            {pwd.next && pwd.next.length < 8 && <p className="text-xs text-amber-600 mt-1">Mínimo 8 caracteres</p>}
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <input className="input" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Repetir contraseña" />
            {pwd.confirm && pwd.next !== pwd.confirm && <p className="text-xs text-rose-600 mt-1">Las contraseñas no coinciden</p>}
          </div>
        </div>
        {pwdErr && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{pwdErr}</div>}
        {pwdOk && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" /> Contraseña actualizada correctamente.
          </div>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" disabled={savePwd.isPending || !pwdValid} onClick={() => savePwd.mutate()}>
            {savePwd.isPending ? "Actualizando…" : "Actualizar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
