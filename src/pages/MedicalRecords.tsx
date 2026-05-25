import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Download, ChevronDown, ChevronUp, Upload, Paperclip, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Spinner } from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import { listRecordsForPatient, createRecord, getPrescriptionPDF, type MedicalRecord } from "../services/ehr";
import { listPatients, getMyPatient } from "../services/patients";
import { uploadFile, listPatientFiles, deleteFile, fileDownloadUrl } from "../services/files";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

export default function MedicalRecords() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const isDoctor = role === "doctor";
  const isAdmin = role === "admin";
  const canCreate = isDoctor || isAdmin;
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPatient, setSelectedPatient] = useState<number | "">(params.get("patient") ? Number(params.get("patient")) : "");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [uploadingRecordId, setUploadingRecordId] = useState<number | null>(null);
  const [form, setForm] = useState({ patient_id: "", chief_complaint: "", diagnosis: "", treatment_plan: "", notes: "", drug: "", dosage: "", frequency: "" });
  const [prescriptions, setPrescriptions] = useState<{ drug: string; dosage: string; frequency: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const myPatient = useQuery({ queryKey: ["my-patient"], queryFn: getMyPatient, enabled: role === "patient" });
  const patientId = role === "patient" ? myPatient.data?.id : (selectedPatient || undefined);

  const records = useQuery({
    queryKey: ["ehr", patientId],
    queryFn: () => listRecordsForPatient(patientId!),
    enabled: !!patientId,
  });

  const allPatients = useQuery({ queryKey: ["patients-all"], queryFn: () => listPatients(), enabled: canCreate });

  const patientFiles = useQuery({
    queryKey: ["patient-files", patientId],
    queryFn: () => listPatientFiles(patientId!),
    enabled: !!patientId && filesOpen,
  });

  const save = useMutation({
    mutationFn: () => createRecord({
      patient_id: Number(form.patient_id || patientId),
      chief_complaint: form.chief_complaint || undefined,
      diagnosis: form.diagnosis || undefined,
      treatment_plan: form.treatment_plan || undefined,
      notes: form.notes || undefined,
      prescriptions: prescriptions.length ? prescriptions : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ehr"] });
      setCreateOpen(false);
      setPrescriptions([]);
      setForm({ patient_id: "", chief_complaint: "", diagnosis: "", treatment_plan: "", notes: "", drug: "", dosage: "", frequency: "" });
    },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const delFile = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patient-files"] }),
  });

  function addPrescription() {
    if (!form.drug) return;
    setPrescriptions([...prescriptions, { drug: form.drug, dosage: form.dosage, frequency: form.frequency }]);
    setForm({ ...form, drug: "", dosage: "", frequency: "" });
  }

  async function downloadPDF(recordId: number) {
    try {
      const blob = await getPrescriptionPDF(recordId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `prescription-${recordId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert(t("common.error")); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !patientId) return;
    setUploadBusy(true);
    try {
      await uploadFile(file, uploadingRecordId ?? undefined, Number(patientId));
      qc.invalidateQueries({ queryKey: ["patient-files"] });
      qc.invalidateQueries({ queryKey: ["ehr"] });
    } catch (err: any) {
      alert(err?.response?.data?.detail || t("common.error"));
    } finally {
      setUploadBusy(false);
      setUploadingRecordId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("records.title")}</h1>
          <p className="text-sm text-ink-500">{t("records.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {patientId && canCreate && (
            <button className="btn-secondary" onClick={() => { setFilesOpen(true); }}>
              <Paperclip className="w-4 h-4" /> {t("records.patientFiles")}
            </button>
          )}
          {canCreate && (
            <button className="btn-gradient" onClick={() => { setErr(null); setCreateOpen(true); }}>
              <Plus className="w-4 h-4" /> {t("records.newConsult")}
            </button>
          )}
        </div>
      </header>

      {canCreate && (
        <div className="card">
          <label className="label">{t("records.selectPatient")}</label>
          <select className="select max-w-md" value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— {t("records.selectPatient")} —</option>
            {(allPatients.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
      )}

      {!patientId && role !== "patient" && (
        <div className="card text-ink-500 text-sm">{t("records.noPatient")}</div>
      )}
      {role === "patient" && myPatient.isLoading && <Spinner />}
      {role === "patient" && !myPatient.isLoading && !myPatient.data && (
        <div className="card text-ink-500 text-sm">{t("records.noProfile")}</div>
      )}

      {records.isLoading && <Spinner />}
      {records.data && records.data.length === 0 && (
        <div className="card text-ink-500 text-sm">{t("records.noRecords")}</div>
      )}
      {(records.data ?? []).map((r: MedicalRecord) => (
        <div key={r.id} className="card">
          <button className="w-full flex items-center justify-between" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-600" />
              <div className="text-left">
                <div className="font-bold">{r.chief_complaint || t("records.medConsult")}</div>
                <div className="text-xs text-ink-500">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canCreate && (
                <button onClick={(e) => { e.stopPropagation(); setUploadingRecordId(r.id); fileInputRef.current?.click(); }}
                  className="btn-ghost btn-sm p-1.5" title={t("records.uploadFile")}>
                  <Upload className="w-3.5 h-3.5 text-ink-500" />
                </button>
              )}
              {r.prescriptions?.length > 0 && (
                <button onClick={(e) => { e.stopPropagation(); downloadPDF(r.id); }}
                  className="btn-secondary btn-sm" title={t("records.downloadPrescription")}>
                  <Download className="w-3.5 h-3.5" /> {t("records.downloadPrescription")}
                </button>
              )}
              {expanded === r.id ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
            </div>
          </button>

          {expanded === r.id && (
            <div className="mt-4 pt-4 border-t border-ink-100 space-y-3 text-sm">
              {r.diagnosis && <div><span className="font-semibold text-ink-800">{t("records.diagnosis")}:</span> <span className="text-ink-700">{r.diagnosis}</span></div>}
              {r.treatment_plan && <div><span className="font-semibold text-ink-800">{t("records.treatment")}:</span> <span className="text-ink-700">{r.treatment_plan}</span></div>}
              {r.notes && <div><span className="font-semibold text-ink-800">{t("records.notes")}:</span> <span className="text-ink-600 italic">{r.notes}</span></div>}
              {r.prescriptions?.length > 0 && (
                <div>
                  <div className="font-semibold text-ink-800 mb-1">{t("records.prescriptions")}:</div>
                  <ul className="space-y-1">
                    {r.prescriptions.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 bg-brand-50 rounded-lg px-3 py-2">
                        <span className="font-semibold text-brand-800">{p.drug}</span>
                        {p.dosage && <span className="text-brand-700">· {p.dosage}</span>}
                        {p.frequency && <span className="text-brand-600">· {p.frequency}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {r.attachments?.length > 0 && (
                <div>
                  <div className="font-semibold text-ink-800 mb-1">{t("records.attachments")}:</div>
                  <div className="flex flex-wrap gap-2">
                    {r.attachments.map((a) => (
                      <a key={a.id} href={fileDownloadUrl(a.id)}
                        className="flex items-center gap-1.5 text-xs bg-ink-100 hover:bg-ink-200 rounded-lg px-3 py-1.5 text-ink-700 font-medium transition">
                        <Paperclip className="w-3 h-3" /> {a.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
      {uploadBusy && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-brand-700 border border-brand-200">
          <Spinner /> {t("records.uploading")}
        </div>
      )}

      <Modal open={filesOpen} onClose={() => setFilesOpen(false)} title={t("records.patientFiles")} size="md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">{t("records.allFiles")}</p>
            <button className="btn-secondary btn-sm" onClick={() => { setUploadingRecordId(null); fileInputRef.current?.click(); }}>
              <Upload className="w-3.5 h-3.5" /> {t("records.uploadFile")}
            </button>
          </div>
          {patientFiles.isLoading ? <Spinner /> : (patientFiles.data ?? []).length === 0 ? (
            <div className="text-ink-400 text-sm py-4 text-center">{t("records.noFiles")}</div>
          ) : (
            <div className="space-y-2">
              {(patientFiles.data ?? []).map((f) => (
                <div key={f.id} className="flex items-center justify-between px-4 py-3 bg-ink-50 rounded-xl border border-ink-200">
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-ink-400" />
                    <div>
                      <div className="font-medium text-sm">{f.filename}</div>
                      <div className="text-xs text-ink-400">{(f.size / 1024).toFixed(1)} KB · {new Date(f.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={fileDownloadUrl(f.id)} className="btn-secondary btn-sm" download>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {canCreate && (
                      <button className="btn-ghost btn-sm p-1.5 text-rose-500" onClick={() => delFile.mutate(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t("records.createModal.title")} size="lg">
        <div className="space-y-4">
          {canCreate && (
            <div>
              <label className="label">{t("consents.patient")} *</label>
              <select className="select" value={form.patient_id || (patientId ?? "")}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                <option value="">{t("insurance.selectProvider")}</option>
                {(allPatients.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">{t("records.chiefComplaint")}</label>
            <input className="input" value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} placeholder={t("records.chiefComplaintPh")} />
          </div>
          <div>
            <label className="label">{t("records.diagnosis")}</label>
            <textarea className="input" rows={2} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder={t("records.diagnosisPh")} />
          </div>
          <div>
            <label className="label">{t("records.treatment")}</label>
            <textarea className="input" rows={2} value={form.treatment_plan} onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })} placeholder={t("records.treatmentPh")} />
          </div>
          <div>
            <label className="label">{t("records.notes")}</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("records.notesPh")} />
          </div>
          <div className="border border-ink-200 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-sm">{t("records.prescriptions")}</div>
            {prescriptions.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-brand-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-semibold">{p.drug}</span>
                {p.dosage && <span>· {p.dosage}</span>}
                {p.frequency && <span>· {p.frequency}</span>}
                <button className="ml-auto text-rose-500" onClick={() => setPrescriptions(prescriptions.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <input className="input" value={form.drug} onChange={(e) => setForm({ ...form, drug: e.target.value })} placeholder={`${t("records.drug")} *`} />
              <input className="input" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder={t("records.dosage")} />
              <input className="input" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder={t("records.frequency")} />
            </div>
            <button className="btn-secondary btn-sm" onClick={addPrescription} disabled={!form.drug}>{t("records.addPrescription")}</button>
          </div>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !(form.patient_id || patientId)}>
              {save.isPending ? t("records.saving") : t("records.saveConsult")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
