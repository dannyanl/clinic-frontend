import api from "./api";

export interface Prescription {
  id?: number;
  drug: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number | null;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  treatment_plan?: string | null;
  notes?: string | null;
  created_at: string;
  prescriptions: Prescription[];
  attachments: { id: number; filename: string; url?: string }[];
}

export const listRecordsForPatient = (patientId: number): Promise<MedicalRecord[]> =>
  api.get<MedicalRecord[]>(`/medical-records/patient/${patientId}`).then((r) => r.data);

export const getRecord = (id: number): Promise<MedicalRecord> =>
  api.get<MedicalRecord>(`/medical-records/${id}`).then((r) => r.data);

export const createRecord = (data: {
  patient_id: number;
  appointment_id?: number;
  chief_complaint?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  prescriptions?: Omit<Prescription, "id">[];
}): Promise<MedicalRecord> =>
  api.post<MedicalRecord>("/medical-records", data).then((r) => r.data);

export const updateRecord = (id: number, data: Partial<{
  chief_complaint: string; diagnosis: string; treatment_plan: string; notes: string;
  prescriptions: Omit<Prescription, "id">[];
}>): Promise<MedicalRecord> =>
  api.patch<MedicalRecord>(`/medical-records/${id}`, data).then((r) => r.data);

export const getPrescriptionPDF = (recordId: number): Promise<Blob> =>
  api.get(`/medical-records/${recordId}/prescription.pdf`, { responseType: "blob" }).then((r) => r.data);
