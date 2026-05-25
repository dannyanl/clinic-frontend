import { api } from "./api";

export const surveys = {
  open: (token: string) => api.get(`/surveys/${token}`).then(r => r.data),
  answer: (token: string, payload: { nps_score: number; comments?: string }) =>
    api.post(`/surveys/${token}/answer`, payload).then(r => r.data),
};
