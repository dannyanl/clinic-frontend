import { api } from "./api";

export interface SearchResult {
  patients: { id: number; name: string; email: string; dni?: string | null }[];
  doctors: { id: number; name: string; specialty?: string | null; license: string }[];
}

export const globalSearch = (q: string): Promise<SearchResult> =>
  api.get<SearchResult>("/search", { params: { q } }).then((r) => r.data);
