import api from "./api";

export interface ConsentTemplate {
  id: number;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface SignedConsent {
  id: number;
  template_id: number;
  template_title: string;
  signed_at: string;
  patient_id: number;
}

export const listConsentTemplates = (): Promise<ConsentTemplate[]> =>
  api.get<ConsentTemplate[]>("/consents/templates").then((r) => r.data);

export const createConsentTemplate = (data: {
  title: string;
  content: string;
}): Promise<ConsentTemplate> =>
  api.post<ConsentTemplate>("/consents/templates", data).then((r) => r.data);

export const updateConsentTemplate = (
  id: number,
  data: { title?: string; content?: string; is_active?: boolean }
): Promise<ConsentTemplate> =>
  api.patch<ConsentTemplate>(`/consents/templates/${id}`, data).then((r) => r.data);

export const deleteConsentTemplate = (id: number): Promise<void> =>
  api.delete(`/consents/templates/${id}`).then(() => undefined);

export const signConsent = (templateId: number): Promise<SignedConsent> =>
  api.post<SignedConsent>("/consents/sign", { template_id: templateId }).then((r) => r.data);

export const myConsents = (): Promise<SignedConsent[]> =>
  api.get<SignedConsent[]>("/consents/me").then((r) => r.data);
