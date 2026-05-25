import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "../../services/api";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";

interface Policy {
  id: number; kind: string; version: string; title: string; body_md: string;
  effective_at: string;
}

export default function LegalPage() {
  const { kind = "privacy" } = useParams();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Policy[]>("/compliance/policies/active")
      .then((r) => setPolicy(r.data.find((p) => p.kind === kind) ?? null))
      .finally(() => setLoading(false));
  }, [kind]);

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 container-narrow py-16">
        {loading ? (
          <div className="text-ink-500">Cargando…</div>
        ) : policy ? (
          <>
            <Link to="/" className="text-sm text-brand-600 hover:underline">← Volver al inicio</Link>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">{policy.title}</h1>
            <div className="text-sm text-ink-500 mt-1">
              Versión {policy.version} · Vigente desde {new Date(policy.effective_at).toLocaleDateString()}
            </div>
            <article className="prose prose-slate max-w-none mt-8 whitespace-pre-wrap text-ink-800 leading-relaxed">
              {policy.body_md}
            </article>
          </>
        ) : (
          <div className="text-ink-500">No se encontró la política solicitada.</div>
        )}
      </main>
      <MarketingFooter />
    </div>
  );
}
