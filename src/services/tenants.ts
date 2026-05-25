import api from "./api";

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  support_email?: string;
}

export const listTenants = (): Promise<Tenant[]> =>
  api.get<Tenant[]>("/tenants").then((r) => r.data);

export const getCurrentTenant = (): Promise<Tenant> =>
  api.get<Tenant>("/tenants/current").then((r) => r.data);

export const updateTenant = (
  id: number,
  data: { name?: string; plan?: string; is_active?: boolean; support_email?: string }
): Promise<Tenant> =>
  api.patch<Tenant>(`/tenants/${id}`, data).then((r) => r.data);
