import api from "./api";

export interface DataRequest {
  id: number;
  user_id: number;
  user_email: string;
  type: "export" | "deletion";
  status: "pending" | "processing" | "completed" | "rejected";
  created_at: string;
  resolved_at?: string;
}

export interface PendingPolicy {
  id: number;
  name: string;
  version: string;
  url: string;
}

export const listDataRequests = (): Promise<DataRequest[]> =>
  api.get<DataRequest[]>("/compliance/data-requests").then((r) => r.data);

export const resolveDataRequest = (
  id: number,
  data: { status: "completed" | "rejected"; notes?: string }
): Promise<DataRequest> =>
  api.post<DataRequest>(`/compliance/data-requests/${id}/resolve`, data).then((r) => r.data);

export const requestMyData = (): Promise<void> =>
  api.post("/compliance/data-requests").then(() => undefined);

export const getPendingPolicies = (): Promise<PendingPolicy[]> =>
  api.get<PendingPolicy[]>("/compliance/policies/me/pending").then((r) => r.data);

export const acceptPolicy = (policyId: number): Promise<void> =>
  api.post("/compliance/policies/accept", { policy_id: policyId }).then(() => undefined);
