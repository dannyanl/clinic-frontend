import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import { getPatient, getPatientHistory } from "../../services/patients";
import { fmtDate, statusColor, statusLabel } from "../../utils/format";
import { Badge } from "../../components/ui/Badge";
import { useI18n } from "../../i18n";

export default function PatientDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const patientId = Number(id);

  const { data: patient, isLoading } = useQuery({ queryKey: ["patient", patientId], queryFn: () => getPatient(patientId) });
  const { data: history = [], isLoading: histLoading } = useQuery({ queryKey: ["patient-history", patientId], queryFn: () => getPatientHistory(patientId) });

  if (isLoading) return <div className="p-10"><Spinner /></div>;
  if (!patient) return <div className="p-10">{t("patients.notFound")}</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> {t("patients.back")}
      </Link>

      <div className="card flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-16 h-16 rounded-2xl grid place-items-center text-white font-bold text-2xl shadow-md flex-shrink-0" style={{background:"linear-gradient(135deg,#8b5cf6,#7c3aed)"}}>
          {patient.full_name.slice(0, 1)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{patient.full_name}</h1>
          <div className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-ink-600">
            <div><span className="font-medium text-ink-800">{t("auth.email")}:</span> {patient.email}</div>
            <div><span className="font-medium text-ink-800">{t("patients.phone")}:</span> {patient.phone ?? "—"}</div>
            <div><span className="font-medium text-ink-800">{t("patients.dni")}:</span> {patient.dni ?? "—"}</div>
            <div><span className="font-medium text-ink-800">{t("patients.dobLabel")}:</span> {patient.birth_date ?? "—"}</div>
            <div><span className="font-medium text-ink-800">{t("patients.blood")}:</span> {patient.blood_type ? <span className="badge-rose">{patient.blood_type}</span> : "—"}</div>
          </div>
          {patient.allergies && (
            <div className="mt-3 text-sm">
              <span className="font-semibold text-amber-700">⚠ {t("patients.allergies")}:</span>{" "}
              <span className="text-ink-700">{patient.allergies}</span>
            </div>
          )}
          {patient.notes && <p className="mt-2 text-sm text-ink-600 italic">{patient.notes}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/medical-records?patient=${patientId}`} className="btn-secondary btn-sm">
            <FileText className="w-3.5 h-3.5" /> {t("patients.records")}
          </Link>
          <Link to={`/appointments/new?patient=${patientId}`} className="btn-gradient btn-sm">
            <Calendar className="w-3.5 h-3.5" /> {t("patients.newAppt")}
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-600" /> {t("patients.historyTab")}
        </h2>
        {histLoading ? <Spinner /> : history.length === 0 ? (
          <div className="text-sm text-ink-500">{t("patients.noHistory")}</div>
        ) : (
          <div className="space-y-2">
            {history.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/50">
                <div className="flex-1 grid sm:grid-cols-3 gap-2">
                  <span className="font-semibold">{fmtDate(a.starts_at)}</span>
                  <span className="text-ink-600">{a.doctor_name ?? `Dr. #${a.doctor_id}`}</span>
                  <span className="text-ink-500 text-sm">{a.reason ?? "—"}</span>
                </div>
                <Badge className={statusColor(a.status)}>{statusLabel(a.status)}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
