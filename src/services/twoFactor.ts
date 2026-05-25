import { api } from "./api";

export const twoFactor = {
  setup: () => api.post("/auth/2fa/setup").then(r => r.data),
  confirm: (code: string) => api.post("/auth/2fa/confirm", { code }).then(r => r.data),
  disable: (code: string) => api.post("/auth/2fa/disable", { code }).then(r => r.data),
};
