import { api } from "./api";

export interface WaitingRoomEntry { id: number; starts_at: string; status: string; doctor?: string | null; patient?: string | null; }
export interface WaitingListEntry { id: number; patient_id: number; specialty_id?: number | null; preferred_date?: string | null; notes?: string | null; status: string; created_at: string; }

export const getTodayWaitingRoom = (location_id?: number): Promise<WaitingRoomEntry[]> =>
  api.get<WaitingRoomEntry[]>("/waiting-room/today", { params: location_id ? { location_id } : undefined }).then((r) => r.data);

export const listWaitingList = (): Promise<WaitingListEntry[]> =>
  api.get<WaitingListEntry[]>("/waiting-list").then((r) => r.data);

export const joinWaitingList = (data: { specialty_id?: number; preferred_date?: string; notes?: string }): Promise<WaitingListEntry> =>
  api.post<WaitingListEntry>("/waiting-list", data).then((r) => r.data);

export const removeFromWaitingList = (id: number): Promise<void> =>
  api.delete(`/waiting-list/${id}`).then(() => undefined);
