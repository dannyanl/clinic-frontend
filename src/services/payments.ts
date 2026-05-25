import api from "./api";

export interface Payment {
  id: number;
  appointment_id: number;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  checkout_url?: string | null;
  created_at: string;
}

export const listPayments = (params?: Record<string, string | number>): Promise<Payment[]> =>
  api.get<Payment[]>("/payments", { params }).then((r) => r.data);

export const getPaymentByAppointment = (appointmentId: number): Promise<Payment> =>
  api.get<Payment>(`/payments/appointment/${appointmentId}`).then((r) => r.data);

export const createPayment = (data: {
  appointment_id: number;
  amount: string;
  provider: "stripe" | "mercadopago" | "manual";
  success_url?: string;
  cancel_url?: string;
}): Promise<Payment> =>
  api.post<Payment>("/payments", data).then((r) => r.data);

export const markPaid = (paymentId: number): Promise<Payment> =>
  api.post<Payment>(`/payments/${paymentId}/mark-paid`).then((r) => r.data);
