import { api } from "./api";

export interface InsuranceProvider { id: number; name: string; code?: string | null; phone?: string | null; }
export interface PatientInsurance { id: number; patient_id: number; provider_id: number; provider_name?: string; policy_number?: string | null; plan?: string | null; }

export const listProviders = (): Promise<InsuranceProvider[]> =>
  api.get<InsuranceProvider[]>("/insurance/providers").then((r) => r.data);

export const createProvider = (data: { name: string; code?: string; phone?: string }): Promise<InsuranceProvider> =>
  api.post<InsuranceProvider>("/insurance/providers", data).then((r) => r.data);

export const listMyInsurances = (): Promise<PatientInsurance[]> =>
  api.get<PatientInsurance[]>("/insurance/me").then((r) => r.data);

export const addMyInsurance = (data: { provider_id: number; policy_number?: string; plan?: string }): Promise<PatientInsurance> =>
  api.post<PatientInsurance>("/insurance/me", data).then((r) => r.data);

export const deleteMyInsurance = (id: number): Promise<void> =>
  api.delete(`/insurance/me/${id}`).then(() => undefined);
