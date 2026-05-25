import api from "./api";

export interface UploadedFile {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  record_id?: number;
  patient_id?: number;
  created_at: string;
}

export const uploadFile = (
  file: File,
  recordId?: number,
  patientId?: number
): Promise<UploadedFile> => {
  const form = new FormData();
  form.append("file", file);
  if (recordId) form.append("record_id", String(recordId));
  if (patientId) form.append("patient_id", String(patientId));
  return api
    .post<UploadedFile>("/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const listPatientFiles = (patientId: number): Promise<UploadedFile[]> =>
  api.get<UploadedFile[]>(`/files/patient/${patientId}`).then((r) => r.data);

export const deleteFile = (id: number): Promise<void> =>
  api.delete(`/files/${id}`).then(() => undefined);

export const fileDownloadUrl = (id: number): string =>
  `/api/v1/files/${id}/download`;
