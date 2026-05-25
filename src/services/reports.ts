import { api } from "./api";
import type { DashboardMetrics } from "../types";

export async function getDashboard(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>("/reports/dashboard");
  return data;
}

export async function getDoctorDashboard(): Promise<{
  appointments_today: number;
  appointments_this_week: number;
  total_patients: number;
  revenue_month: number;
  pending_to_confirm: number;
}> {
  const { data } = await api.get("/reports/doctor-dashboard");
  return data;
}

export async function getOccupancy(date_from: string, date_to: string) {
  const { data } = await api.get("/reports/occupancy", { params: { date_from, date_to } });
  return data;
}

export async function getCancellations(date_from: string, date_to: string) {
  const { data } = await api.get("/reports/cancellations", { params: { date_from, date_to } });
  return data;
}

export async function getRevenue(date_from: string, date_to: string) {
  const { data } = await api.get("/reports/revenue", { params: { date_from, date_to } });
  return data;
}

export async function getNpsAggregate(): Promise<{
  avg_score: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
  nps_score: number;
}> {
  const { data } = await api.get("/surveys/admin/aggregate");
  return data;
}

export function buildExportUrl(
  type: "appointments_csv" | "appointments_xlsx" | "appointments_pdf" | "patients_csv",
  params?: Record<string, string>
): string {
  const map: Record<string, string> = {
    appointments_csv: "/export/appointments.csv",
    appointments_xlsx: "/export/appointments.xlsx",
    appointments_pdf: "/export/appointments.pdf",
    patients_csv: "/export/patients.csv",
  };
  const base = `/api/v1${map[type]}`;
  if (!params) return base;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${base}?${qs}` : base;
}
