import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Trash2, Building2 } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { listProviders, createProvider, listMyInsurances, addMyInsurance, deleteMyInsurance } from "../services/insurance";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

export default function Insurance() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "admin";
  const isPatient = role === "patient";
  const qc = useQueryClient();

  const [provModal, setProvModal] = useState(false);
  const [insModal, setInsModal] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [provForm, setProvForm] = useState({ name: "", code: "", phone: "" });
  const [insForm, setInsForm] = useState({ provider_id: "", policy_number: "", plan: "" });
  const [err, setErr] = useState<string | null>(null);

  const providers = useQuery({ queryKey: ["ins-providers"], queryFn: listProviders });
  const myIns = useQuery({ queryKey: ["my-insurance"], queryFn: listMyInsurances, enabled: isPatient });

  const addProv = useMutation({
    mutationFn: () => createProvider({ name: provForm.name, code: provForm.code || undefined, phone: provForm.phone || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ins-providers"] }); setProvModal(false); setProvForm({ name: "", code: "", phone: "" }); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const addIns = useMutation({
    mutationFn: () => addMyInsurance({ provider_id: Number(insForm.provider_id), policy_number: insForm.policy_number || undefined, plan: insForm.plan || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-insurance"] }); setInsModal(false); setInsForm({ provider_id: "", policy_number: "", plan: "" }); },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const delIns = useMutation({
    mutationFn: () => deleteMyInsurance(delId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-insurance"] }); setDelId(null); },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold flex items-center gap-2"><Shield className="w-7 h-7 text-brand-600" /> {t("insurance.title")}</h1>
        <p className="text-sm text-ink-500">{t("insurance.subtitle")}</p>
      </header>

      {isPatient && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{t("insurance.myInsurances")}</h2>
            <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setInsModal(true); }}>
              <Plus className="w-3.5 h-3.5" /> {t("insurance.addCoverage")}
            </button>
          </div>
          {myIns.isLoading ? <Spinner /> : (myIns.data ?? []).length === 0 ? (
            <div className="text-ink-500 text-sm">{t("insurance.noCoverage")}</div>
          ) : (
            <div className="space-y-3">
              {(myIns.data ?? []).map((i) => (
                <div key={i.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-brand-600" />
                    <div>
                      <div className="font-semibold">{i.provider_name ?? `${t("insurance.provider")} #${i.provider_id}`}</div>
                      {i.policy_number && <div className="text-xs text-ink-500">{t("insurance.policy")}: {i.policy_number}</div>}
                      {i.plan && <div className="text-xs text-ink-500">{t("insurance.plan")}: {i.plan}</div>}
                    </div>
                  </div>
                  <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => setDelId(i.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-ink-600" /> {t("insurance.providers")}</h2>
          {isAdmin && (
            <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setProvModal(true); }}>
              <Plus className="w-3.5 h-3.5" /> {t("insurance.addProvider")}
            </button>
          )}
        </div>
        {providers.isLoading ? <Spinner /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(providers.data ?? []).map((p) => (
              <div key={p.id} className="px-4 py-3 rounded-xl border border-ink-200 bg-ink-50">
                <div className="font-semibold">{p.name}</div>
                {p.code && <div className="text-xs text-ink-500 mt-0.5">{t("insurance.code")}: {p.code}</div>}
                {p.phone && <div className="text-xs text-ink-500">{p.phone}</div>}
              </div>
            ))}
            {(providers.data ?? []).length === 0 && <div className="text-ink-500 text-sm">{t("insurance.noProviders")}</div>}
          </div>
        )}
      </div>

      <Modal open={provModal} onClose={() => setProvModal(false)} title={t("insurance.providerModal.title")} size="sm">
        <div className="space-y-4">
          <div><label className="label">{t("patients.name")} *</label><input className="input" value={provForm.name} onChange={(e) => setProvForm({ ...provForm, name: e.target.value })} placeholder={t("insurance.providerModal.namePh")} /></div>
          <div><label className="label">{t("insurance.code")}</label><input className="input" value={provForm.code} onChange={(e) => setProvForm({ ...provForm, code: e.target.value })} /></div>
          <div><label className="label">{t("patients.phone")}</label><input className="input" value={provForm.phone} onChange={(e) => setProvForm({ ...provForm, phone: e.target.value })} /></div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setProvModal(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={!provForm.name || addProv.isPending} onClick={() => addProv.mutate()}>{t("common.save")}</button>
          </div>
        </div>
      </Modal>

      <Modal open={insModal} onClose={() => setInsModal(false)} title={t("insurance.insModal.title")} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{t("insurance.provider")} *</label>
            <select className="select" value={insForm.provider_id} onChange={(e) => setInsForm({ ...insForm, provider_id: e.target.value })}>
              <option value="">{t("insurance.selectProvider")}</option>
              {(providers.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t("insurance.policyNumber")}</label><input className="input" value={insForm.policy_number} onChange={(e) => setInsForm({ ...insForm, policy_number: e.target.value })} /></div>
          <div><label className="label">{t("insurance.plan")}</label><input className="input" value={insForm.plan} onChange={(e) => setInsForm({ ...insForm, plan: e.target.value })} /></div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setInsModal(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" disabled={!insForm.provider_id || addIns.isPending} onClick={() => addIns.mutate()}>{t("common.save")}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={delId !== null} danger title={t("insurance.deleteTitle")}
        message={t("insurance.deleteMsg")}
        onConfirm={() => delIns.mutate()} onClose={() => setDelId(null)} />
    </div>
  );
}
