import { api } from "./api";
import type { Tenant } from "../types";

export interface SuperAdminStats {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_appointments_today: number;
  total_revenue_month: number;
}

export const getSuperAdminStats = (): Promise<SuperAdminStats> =>
  api.get<SuperAdminStats>("/superadmin/stats").then((r) => r.data);

export const listAllTenants = (): Promise<Tenant[]> =>
  api.get<Tenant[]>("/superadmin/tenants").then((r) => r.data);

export const createTenant = (data: {
  name: string;
  subdomain: string;
  plan: string;
  support_email?: string;
  admin_email: string;
  admin_name: string;
  admin_password: string;
}): Promise<Tenant> =>
  api.post<Tenant>("/superadmin/tenants", data).then((r) => r.data);

export const updateTenantAdmin = (
  id: number,
  data: { name?: string; plan?: string; is_active?: boolean; support_email?: string }
): Promise<Tenant> =>
  api.patch<Tenant>(`/superadmin/tenants/${id}`, data).then((r) => r.data);

export const suspendTenant = (id: number): Promise<Tenant> =>
  api.post<Tenant>(`/superadmin/tenants/${id}/suspend`).then((r) => r.data);

export const activateTenant = (id: number): Promise<Tenant> =>
  api.post<Tenant>(`/superadmin/tenants/${id}/activate`).then((r) => r.data);
