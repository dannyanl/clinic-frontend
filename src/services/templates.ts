import api from "./api";

export interface MessageTemplate {
  id: number;
  name: string;
  channel: "email" | "sms" | "whatsapp";
  event: string;
  subject?: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export const listTemplates = (): Promise<MessageTemplate[]> =>
  api.get<MessageTemplate[]>("/templates").then((r) => r.data);

export const createTemplate = (data: {
  name: string;
  channel: string;
  event: string;
  subject?: string;
  body: string;
}): Promise<MessageTemplate> =>
  api.post<MessageTemplate>("/templates", data).then((r) => r.data);

export const updateTemplate = (
  id: number,
  data: Partial<MessageTemplate>
): Promise<MessageTemplate> =>
  api.patch<MessageTemplate>(`/templates/${id}`, data).then((r) => r.data);

export const deleteTemplate = (id: number): Promise<void> =>
  api.delete(`/templates/${id}`).then(() => undefined);
