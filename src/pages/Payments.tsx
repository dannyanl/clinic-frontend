import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, Check, Clock, CheckCircle2 } from "lucide-react";

import { Spinner } from "../components/ui/Spinner";
import { listPayments, createPayment, markPaid } from "../services/payments";
import { listAppointments } from "../services/appointments";
import { fmtDate } from "../utils/format";
import { useAuthStore } from "../store/authStore";
import { useI18n } from "../i18n";

export default function Payments() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "admin" || role === "receptionist";
  const [busy, setBusy] = useState<number | null>(null);
  const [markBusy, setMarkBusy] = useState<number | null>(null);

  const STATUS_COLOR: Record<string, string> = {
    pending: "badge-amber", paid: "badge-green", failed: "badge-rose", refunded: "badge-slate",
  };
  const STATUS_LABEL: Record<string, string> = {
    pending: t("payments.status.pending"),
    paid: t("payments.status.paid"),
    failed: t("payments.status.failed"),
    refunded: t("payments.status.refunded"),
  };

  const { data: payments = [], isLoading } = useQuery({ queryKey: ["payments"], queryFn: listPayments });
  const { data: appts = [] } = useQuery({ queryKey: ["appointments-pay"], queryFn: listAppointments });

  const pendingAppts = appts.filter((a) => a.status !== "cancelled" && !payments.some((p) => p.appointment_id === a.id));

  const doMarkPaid = useMutation({
    mutationFn: markPaid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
    onError: (e: any) => alert(e?.response?.data?.detail || t("common.error")),
  });

  async function pay(apptId: number, provider: "stripe" | "mercadopago" | "paypal" | "manual") {
    setBusy(apptId);
    try {
      const p = await createPayment({
        appointment_id: apptId,
        amount: "0.00",
        provider,
        success_url: window.location.origin + "/payments?ok=1",
        cancel_url: window.location.origin + "/payments?cancel=1",
      });
      if (p.checkout_url) window.location.href = p.checkout_url;
      else { qc.invalidateQueries({ queryKey: ["payments"] }); }
    } catch (e: any) { alert(e?.response?.data?.detail || t("common.error")); }
    finally { setBusy(null); }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in space-y-6">
      <header>
        <div className="flex items-center gap-3 mb-1">
          <DollarSign className="w-6 h-6 text-brand-600" />
          <h1 className="text-3xl font-extrabold">{t("payments.title")}</h1>
        </div>
        <p className="text-sm text-ink-500">{t("payments.subtitle")}</p>
      </header>

      {pendingAppts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> {t("payments.pendingAppts")}
          </h2>
          <div className="space-y-3">
            {pendingAppts.map((a) => (
              <div key={a.id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{a.doctor_name ?? `Dr. #${a.doctor_id}`}</div>
                  <div className="text-sm text-ink-500">{fmtDate(a.starts_at)} · {a.reason ?? t("payments.reason")}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button disabled={busy === a.id} onClick={() => pay(a.id, "stripe")}
                    className="btn-primary btn-sm flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Stripe
                  </button>
                  <button disabled={busy === a.id} onClick={() => pay(a.id, "mercadopago")}
                    className="btn-secondary btn-sm flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> MercadoPago
                  </button>
                  <button disabled={busy === a.id} onClick={() => pay(a.id, "paypal")}
                    className="btn-secondary btn-sm flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> PayPal
                  </button>
                  <button disabled={busy === a.id} onClick={() => pay(a.id, "manual")}
                    className="btn-ghost btn-sm">
                    {t("payments.manual")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" /> {t("payments.history")}
        </h2>
        {isLoading ? <Spinner /> : payments.length === 0 ? (
          <div className="card text-ink-500 text-sm">{t("payments.noPending")}</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">{t("payments.date")}</th>
                  <th className="text-left px-4 py-3">{t("payments.appt")}</th>
                  <th className="text-left px-4 py-3">{t("payments.provider")}</th>
                  <th className="text-left px-4 py-3">{t("payments.amount")}</th>
                  <th className="text-left px-4 py-3">{t("payments.status")}</th>
                  {canManage && <th className="text-right px-4 py-3">{t("common.actions")}</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                    <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">#{p.appointment_id}</td>
                    <td className="px-4 py-3 capitalize">{p.provider}</td>
                    <td className="px-4 py-3 font-semibold">{p.currency} {Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLOR[p.status] ?? "badge-slate"}`}>{STATUS_LABEL[p.status] ?? p.status}</span></td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        {p.status === "pending" && (
                          <button
                            className="btn-secondary btn-sm flex items-center gap-1.5 ml-auto"
                            disabled={markBusy === p.id}
                            onClick={() => { setMarkBusy(p.id); doMarkPaid.mutate(p.id, { onSettled: () => setMarkBusy(null) }); }}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {markBusy === p.id ? t("payments.processing") : t("payments.markPaid")}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
