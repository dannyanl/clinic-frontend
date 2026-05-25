import api from "./api";

export interface TrashedPatient {
  id: number;
  full_name: string;
  email: string;
  deleted_at: string;
}

export interface TrashedAppointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  starts_at: string;
  deleted_at: string;
}

export const listTrashedPatients = (): Promise<TrashedPatient[]> =>
  api.get<TrashedPatient[]>("/trash/patients").then((r) => r.data);

export const restorePatient = (id: number): Promise<void> =>
  api.post(`/trash/patients/${id}/restore`).then(() => undefined);

export const listTrashedAppointments = (): Promise<TrashedAppointment[]> =>
  api.get<TrashedAppointment[]>("/trash/appointments").then((r) => r.data);

export const restoreAppointment = (id: number): Promise<void> =>
  api.post(`/trash/appointments/${id}/restore`).then(() => undefined);
