import api from "./api";
import type { Appointment, AppointmentSlot, AppointmentType } from "../types";

export const listAppointments = (params?: Record<string, string | number>): Promise<Appointment[]> =>
  api.get<Appointment[]>("/appointments", { params }).then((r) => r.data);

export const getAppointment = (id: number): Promise<Appointment> =>
  api.get<Appointment>(`/appointments/${id}`).then((r) => r.data);

export const createAppointment = (payload: {
  doctor_id: number;
  patient_id?: number;
  starts_at: string;
  reason?: string;
  appointment_type?: AppointmentType;
  is_telemedicine?: boolean;
}): Promise<Appointment> =>
  api.post<Appointment>("/appointments", payload).then((r) => r.data);

export const createAppointmentSeries = (payload: {
  doctor_id: number;
  patient_id?: number;
  starts_at: string;
  reason?: string;
  appointment_type?: AppointmentType;
  is_telemedicine?: boolean;
  recurrence: "weekly" | "biweekly" | "monthly";
  occurrences: number;
}): Promise<Appointment[]> =>
  api.post<Appointment[]>("/appointments/series", payload).then((r) => r.data);

export const updateAppointment = (
  id: number,
  data: Partial<{
    status: string;
    notes: string;
    reason: string;
    starts_at: string;
    appointment_type: AppointmentType;
  }>
): Promise<Appointment> =>
  api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data);

export const cancelAppointment = (id: number): Promise<void> =>
  api.delete(`/appointments/${id}`).then(() => undefined);

export const checkInAppointment = (id: number): Promise<Appointment> =>
  api.post<Appointment>(`/appointments/${id}/check-in`).then((r) => r.data);

export const getSlots = (doctorId: number, day: string): Promise<AppointmentSlot[]> =>
  api.get<AppointmentSlot[]>("/appointments/slots", {
    params: { doctor_id: doctorId, day },
  }).then((r) => r.data);
