import { api } from "./api";

export interface InventoryItem { id: number; sku: string; name: string; unit: string; stock: number; min_stock: number; cost: number; low: boolean; location_id?: number | null; }

export const listInventory = (low_only?: boolean): Promise<InventoryItem[]> =>
  api.get<InventoryItem[]>("/inventory", { params: low_only ? { low_only: true } : undefined }).then((r) => r.data);

export const createItem = (data: { sku: string; name: string; unit?: string; stock?: number; min_stock?: number; cost?: number; location_id?: number }): Promise<{ id: number }> =>
  api.post<{ id: number }>("/inventory", data).then((r) => r.data);

export const addMovement = (itemId: number, delta: number, reason?: string): Promise<{ stock: number }> =>
  api.post<{ stock: number }>(`/inventory/${itemId}/movement`, { delta, reason }).then((r) => r.data);
