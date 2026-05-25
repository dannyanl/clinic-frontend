import api from "./api";

export interface ReminderPolicy {
  id: number;
  hours_before: number;
  channel: "email" | "sms" | "whatsapp" | "push";
  is_active: boolean;
  created_at: string;
}

export const listReminderPolicies = (): Promise<ReminderPolicy[]> =>
  api.get<ReminderPolicy[]>("/policies/reminders").then((r) => r.data);

export const createReminderPolicy = (data: {
  hours_before: number;
  channel: string;
}): Promise<ReminderPolicy> =>
  api.post<ReminderPolicy>("/policies/reminders", data).then((r) => r.data);

export const deleteReminderPolicy = (id: number): Promise<void> =>
  api.delete(`/policies/reminders/${id}`).then(() => undefined);
