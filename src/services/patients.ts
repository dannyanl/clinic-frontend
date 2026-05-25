import api from "./api";
import type { Patient, Appointment } from "../types";

export const listPatients = (q?: string): Promise<Patient[]> =>
  api.get<Patient[]>("/patients/", { params: q ? { q } : undefined }).then((r) => r.data);

export const getPatient = (id: number): Promise<Patient> =>
  api.get<Patient>(`/patients/${id}`).then((r) => r.data);

export const getMyPatient = (): Promise<Patient> =>
  api.get<Patient>("/patients/me").then((r) => r.data);

export const createPatient = (data: {
  email: string; full_name: string; phone?: string; password: string;
  dni?: string; birth_date?: string; blood_type?: string; allergies?: string; notes?: string;
}): Promise<Patient> =>
  api.post<Patient>("/patients/", data).then((r) => r.data);

export const updatePatient = (id: number, data: Partial<{
  full_name: string; phone: string; dni: string;
  birth_date: string; blood_type: string; allergies: string; notes: string;
}>): Promise<Patient> =>
  api.patch<Patient>(`/patients/${id}`, data).then((r) => r.data);

export const deletePatient = (id: number) => api.delete(`/patients/${id}`);

export const getPatientHistory = (id: number): Promise<Appointment[]> =>
  api.get<Appointment[]>(`/patients/${id}/history`).then((r) => r.data);
