import { api } from "./api";

export const verifyPrescription = (token: string) =>
  api.get(`/verify-prescription/${token}`).then(r => r.data);
