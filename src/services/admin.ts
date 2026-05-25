import api from "./api";
import type { User, Specialty, Doctor } from "../types";

export interface Location {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
}

// ─── Specialties ────────────────────────────────────────────
export const listSpecialties = () =>
  api.get<Specialty[]>("/specialties/").then((r) => r.data);

export const createSpecialty = (data: { name: string; description?: string }) =>
  api.post<Specialty>("/specialties/", data).then((r) => r.data);

export const updateSpecialty = (id: number, data: Partial<{ name: string; description: string }>) =>
  api.patch<Specialty>(`/specialties/${id}`, data).then((r) => r.data);

export const deleteSpecialty = (id: number) =>
  api.delete(`/specialties/${id}`);

// ─── Locations ───────────────────────────────────────────────
export const listLocations = () =>
  api.get<Location[]>("/locations").then((r) => r.data);

export const createLocation = (data: { name: string; address?: string; phone?: string }) =>
  api.post<Location>("/locations", data).then((r) => r.data);

export const updateLocation = (id: number, data: Partial<Location>) =>
  api.patch<Location>(`/locations/${id}`, data).then((r) => r.data);

export const deleteLocation = (id: number) =>
  api.delete(`/locations/${id}`);

// ─── Users ───────────────────────────────────────────────────
export const listUsers = () =>
  api.get<User[]>("/users/").then((r) => r.data);

export const updateUser = (id: number, data: Partial<{ full_name: string; role: string; is_active: boolean; phone: string }>) =>
  api.patch<User>(`/users/${id}`, data).then((r) => r.data);

// ─── Admin logs ──────────────────────────────────────────────
export const listLogs = () =>
  api.get<any[]>("/admin/logs").then((r) => r.data);
