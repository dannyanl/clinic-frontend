import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck, CheckCircle, ClipboardList } from "lucide-react";

import { Spinner } from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import {
  listConsentTemplates,
  myConsents,
  signConsent,
  type ConsentTemplate,
  type SignedConsent,
} from "../../services/consents";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";

export default function ConsentsPage() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.user?.role);
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<ConsentTemplate | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["consent-templates"],
    queryFn: listConsentTemplates,
  });

  const { data: signed = [], isLoading: loadingSigned } = useQuery({
    queryKey: ["my-consents"],
    queryFn: myConsents,
    enabled: role === "patient",
  });

  const sign = useMutation({
    mutationFn: (templateId: number) => signConsent(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-consents"] });
      setViewing(null);
      setErr(null);
    },
    onError: (e: any) => setErr(e?.response?.data?.detail ?? t("common.error")),
  });

  const isAlreadySigned = (templateId: number) =>
    signed.some((s: SignedConsent) => s.template_id === templateId);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <FileCheck className="w-8 h-8 text-brand-600" /> {t("consents.title")}
        </h1>
        <p className="text-sm text-ink-500">{t("consents.subtitle")}</p>
      </header>

      {role === "patient" && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" /> {t("consents.signed")}
          </h2>
          {loadingSigned ? <Spinner /> : signed.length === 0 ? (
            <div className="card text-ink-500 text-sm text-center py-4">{t("consents.noConsents")}</div>
          ) : (
            <div className="space-y-2">
              {signed.map((s: SignedConsent) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-800">{(s as any).template_title}</div>
                    <div className="text-xs text-emerald-600">{t("consents.signed")}: {new Date((s as any).signed_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold mb-3">
          {role === "patient" ? t("consents.pending") : t("consents.title")}
        </h2>
        {loadingTemplates ? <Spinner /> : templates.length === 0 ? (
          <div className="card text-ink-500 text-sm text-center py-6">{t("consents.noConsents")}</div>
        ) : (
          <div className="space-y-3">
            {templates.filter((tp) => (tp as any).is_active).map((tp) => {
              const alreadySigned = isAlreadySigned(tp.id);
              return (
                <div key={tp.id} className="card flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${alreadySigned ? "bg-emerald-100" : "bg-brand-100"}`}>
                    {alreadySigned
                      ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                      : <FileCheck className="w-5 h-5 text-brand-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{tp.title}</div>
                    <div className="text-sm text-ink-500 mt-1 line-clamp-2">{(tp as any).content?.slice(0, 150)}{((tp as any).content?.length ?? 0) > 150 ? "…" : ""}</div>
                    {alreadySigned && (
                      <div className="text-xs text-emerald-600 mt-1 font-semibold">✓ {t("consents.signed")}</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="btn-secondary btn-sm" onClick={() => { setErr(null); setViewing(tp); }}>
                      {t("consents.view")}
                    </button>
                    {role === "patient" && !alreadySigned && (
                      <button className="btn-primary btn-sm" onClick={() => sign.mutate(tp.id)} disabled={sign.isPending}>
                        {t("consents.sign")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.title ?? t("consents.title")} size="lg">
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none text-ink-700 bg-ink-50 rounded-xl p-4 max-h-80 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
            {(viewing as any)?.content}
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</div>}
          {role === "patient" && viewing && !isAlreadySigned(viewing.id) && (
            <div className="border-t border-ink-100 pt-4">
              <p className="text-sm text-ink-600 mb-3">{t("consents.signatureLabel")}</p>
              <div className="flex gap-2 justify-end">
                <button className="btn-secondary" onClick={() => setViewing(null)}>{t("common.close")}</button>
                <button className="btn-gradient" onClick={() => sign.mutate(viewing.id)} disabled={sign.isPending}>
                  {sign.isPending ? t("consents.signing") : <><CheckCircle className="w-4 h-4" /> {t("consents.signBtn")}</>}
                </button>
              </div>
            </div>
          )}
          {(role !== "patient" || (viewing && isAlreadySigned(viewing.id))) && (
            <div className="flex justify-end">
              <button className="btn-secondary" onClick={() => setViewing(null)}>{t("common.close")}</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
