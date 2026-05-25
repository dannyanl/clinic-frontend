import api from "./api";
import type { Doctor, Specialty } from "../types";

export interface Schedule {
  id: number;
  doctor_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  location_id?: number | null;
  slot_minutes: number;
}

export interface Absence {
  id: number;
  doctor_id: number;
  date: string;
  reason?: string | null;
}

export const listDoctors = (params?: { specialty_id?: number; q?: string }): Promise<Doctor[]> =>
  api.get<Doctor[]>("/doctors/", { params }).then((r) => r.data);

export const getDoctor = (id: number): Promise<Doctor> =>
  api.get<Doctor>(`/doctors/${id}`).then((r) => r.data);

export const createDoctor = (data: {
  email: string; full_name: string; phone?: string; password: string;
  specialty_id: number; license_number: string; bio?: string; consultation_fee?: number;
}): Promise<Doctor> =>
  api.post<Doctor>("/doctors/", data).then((r) => r.data);

export const updateDoctor = (id: number, data: Partial<{
  full_name: string; phone: string; bio: string;
  consultation_fee: number; specialty_id: number; is_active: boolean;
}>): Promise<Doctor> =>
  api.patch<Doctor>(`/doctors/${id}`, data).then((r) => r.data);

export const deleteDoctor = (id: number) => api.delete(`/doctors/${id}`);

export const listSpecialties = (): Promise<Specialty[]> =>
  api.get<Specialty[]>("/specialties/").then((r) => r.data);

export const listSchedules = (doctorId: number): Promise<Schedule[]> =>
  api.get<Schedule[]>(`/doctors/${doctorId}/schedules`).then((r) => r.data);

export const createSchedule = (doctorId: number, data: {
  weekday: number; start_time: string; end_time: string; slot_minutes?: number; location_id?: number;
}): Promise<Schedule> =>
  api.post<Schedule>(`/doctors/${doctorId}/schedules`, data).then((r) => r.data);

export const deleteSchedule = (doctorId: number, scheduleId: number) =>
  api.delete(`/doctors/${doctorId}/schedules/${scheduleId}`);

export const listAbsences = (doctorId: number): Promise<Absence[]> =>
  api.get<Absence[]>(`/doctors/${doctorId}/absences`).then((r) => r.data);

export const createAbsence = (doctorId: number, data: { date: string; reason?: string }): Promise<Absence> =>
  api.post<Absence>(`/doctors/${doctorId}/absences`, data).then((r) => r.data);
