import api from "./api";

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  doctor_name: string;
  patient_name: string;
  is_telemedicine?: boolean;
}

export const getWeekEvents = (
  from: string,
  to: string
): Promise<CalendarEvent[]> =>
  api
    .get<CalendarEvent[]>("/calendar", { params: { from, to } })
    .then((r) => r.data);

export const getDoctorSubscribeUrl = (
  doctorId: number
): Promise<{ url: string }> =>
  api
    .get<{ url: string }>(`/calendar/doctor/${doctorId}/subscribe-url`)
    .then((r) => r.data);
