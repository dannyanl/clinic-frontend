import { Link } from "react-router-dom";
import {
  CalendarDays, Stethoscope, FileText, ShieldCheck, BarChart3, CreditCard,
  Bell, Globe2, Lock, Check, ArrowRight, Sparkles, Building2, Users, Star,
} from "lucide-react";

import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { useI18n } from "../../i18n";

const COMPLIANCE = ["HIPAA-ready", "RGPD / GDPR", "ISO 27001", "SOC 2 (in progress)", "Ley 25.326 (AR)", "LFPDPPP (MX)"];

const STATS = [
  { value: "+540", labelKey: "landing.stat.clinics" },
  { value: "1.2 M", labelKey: "landing.stat.appts" },
  { value: "99.95 %", labelKey: "landing.stat.uptime" },
  { value: "< 200 ms", labelKey: "landing.stat.latency" },
];

const TESTIMONIALS = [
  { name: "Dr. Lucía Fernández", role: "Medical Director · Clínica Salud Plena", quote: "We went from Excel to Clinix in 2 weeks. Occupancy rose 22% and no-shows dropped in half." },
  { name: "Mg. Diego Romero", role: "CEO · DentalCare Dental Network", quote: "I manage 14 locations from one console. The HIPAA compliance piece sealed the deal." },
  { name: "Dr. Sofía Linares", role: "Independent Pediatrician", quote: "Patients book through WhatsApp on their own. I got back 8 hours of admin work weekly." },
];

export default function Landing() {
  const { t } = useI18n();

  const FEATURES = [
    { icon: CalendarDays, title: t("appointments.title") ?? "Smart scheduling", desc: "24/7 online booking, automatic reminders by email & WhatsApp, no-show management." },
    { icon: Stethoscope, title: t("records.title"), desc: "Versioned EHR, specialty templates, full-text search, digital prescription signing." },
    { icon: FileText, title: t("records.downloadPrescription"), desc: "Generate prescriptions with verifiable QR code. Compliant with LATAM and EU regulations." },
    { icon: CreditCard, title: t("payments.title"), desc: "Local gateway integrations, automatic reconciliation, exportable to your accountant." },
    { icon: BarChart3, title: t("reports.title"), desc: "Executive dashboard with KPIs: occupancy, revenue, conversion, NPS and more." },
    { icon: Bell, title: t("reports.nps"), desc: "Measure satisfaction after each visit and act fast with intelligent alerts." },
  ];

  const PLANS = [
    {
      name: t("landing.pricing.starter"), price: "$49", period: "/mo",
      description: "For independent professionals and small practices.",
      features: ["Up to 2 providers", "Online scheduling", "Email reminders", "Basic EHR", "Email support"],
      cta: t("landing.pricing.cta"),
    },
    {
      name: t("landing.pricing.pro"), price: "$149", period: "/mo",
      description: "For growing clinics that need full power.",
      features: ["Up to 10 providers", "WhatsApp reminders", "Digital prescriptions with QR", "Payments & billing", "Advanced analytics", "NPS surveys"],
      cta: t("landing.hero.cta"), featured: true,
    },
    {
      name: t("landing.pricing.enterprise"), price: "Custom", period: "",
      description: "Multi-location, custom integrations and dedicated SLA.",
      features: ["Unlimited providers", "Multi-clinic / multi-brand", "Custom domains", "API & webhooks", "SSO / SAML", "HIPAA / GDPR compliance", "Dedicated onboarding"],
      cta: "Talk to sales",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-soft-gradient">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="container-wide relative pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-ink-200 text-xs font-semibold text-ink-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent-600" />
              New · AI assistant for medical records
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              {t("landing.hero.title").split(" ").slice(0, 3).join(" ")} <span className="text-gradient">{t("landing.hero.title").split(" ").slice(3).join(" ")}</span>
            </h1>
            <p className="mt-5 text-lg text-ink-600 max-w-xl">{t("landing.hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-gradient btn-lg">
                {t("landing.hero.cta")} <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="btn-secondary btn-lg">Live demo</a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> No credit card</div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 5 min setup</div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cancel anytime</div>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 bg-brand-gradient blur-3xl opacity-20 rounded-full" />
            <DashboardMock />
          </div>
        </div>

        <div className="container-wide pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 card-glass py-6 px-8">
            {STATS.map((s) => (
              <div key={s.labelKey} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-extrabold text-gradient">{s.value}</div>
                <div className="text-xs text-ink-500 mt-1 uppercase tracking-wider">{s.labelKey.replace("landing.stat.", "").replace("clinics", "Active clinics").replace("appts", "Appointments / month").replace("uptime", "Uptime SLA").replace("latency", "Median latency")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge-blue">Features</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">{t("landing.features.title")}</h2>
            <p className="mt-3 text-ink-600">Built with doctors, receptionists and administrators. Designed to scale from 1 to 100 locations without painful migrations.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover">
                <div className="w-11 h-11 rounded-xl bg-brand-gradient grid place-items-center shadow-md mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">{title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="section bg-ink-900 text-white">
        <div className="container-wide grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance & Security
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Your clinical data, ironclad.</h2>
            <p className="mt-3 text-ink-300 max-w-xl">
              Encryption at rest and in transit, 2FA, complete PHI access audit, soft-delete with configurable retention and one-click data portability.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {COMPLIANCE.map((c) => (
                <li key={c} className="flex items-center gap-2 text-ink-200">
                  <Lock className="w-4 h-4 text-brand-300" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Lock, title: "AES-256 encryption", desc: "At rest and TLS 1.3 in transit." },
              { icon: ShieldCheck, title: "2FA TOTP", desc: "Compatible with Google / Authy." },
              { icon: FileText, title: "PHI Audit log", desc: "Who viewed which record and when." },
              { icon: Globe2, title: "Multi-region", desc: "Data hosted in your jurisdiction." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card bg-white/5 border-white/10 text-white">
                <Icon className="w-6 h-6 text-brand-300 mb-3" />
                <div className="font-bold">{title}</div>
                <p className="text-sm text-ink-300 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge-violet">Clients</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Teams that already made the leap.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-0.5 mb-3 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-ink-700 leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 pt-4 border-t border-ink-100">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-ink-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section bg-soft-gradient">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge-green">Pricing</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">{t("landing.pricing.title")}</h2>
            <p className="mt-3 text-ink-600">14 days free on any plan. No required annual contracts.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div key={p.name}
                className={`card flex flex-col ${(p as any).featured ? "ring-2 ring-brand-500 shadow-card scale-[1.02] relative" : ""}`}>
                {(p as any).featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gradient text-white text-xs font-bold shadow-md">
                    Most popular
                  </div>
                )}
                <div className="font-display text-xl font-bold">{p.name}</div>
                <p className="text-sm text-ink-500 mt-1 min-h-[2.5rem]">{p.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-ink-500">{p.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-6 ${(p as any).featured ? "btn-gradient" : "btn-secondary"} w-full justify-center`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="section">
        <div className="container-wide grid md:grid-cols-3 gap-5">
          {[
            { icon: Stethoscope, title: "Independent professionals", desc: "Leave Excel and WhatsApp behind. Your schedule and patients in one place." },
            { icon: Building2, title: "Clinics and medical centers", desc: "Coordinate reception, doctors and administration with role-based views." },
            { icon: Users, title: "Networks and franchises", desc: "Manage dozens of locations with your own brand, domains and consolidated metrics." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-hover">
              <Icon className="w-7 h-7 text-brand-600 mb-3" />
              <div className="font-display font-bold text-lg">{title}</div>
              <p className="text-sm text-ink-600 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container-wide">
          <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-16 text-center shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold">Ready to modernize your clinic?</h2>
              <p className="mt-4 text-white/85 max-w-xl mx-auto">Try free for 14 days. No credit card. Assisted migration at no cost from your current system.</p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link to="/register" className="btn-lg bg-white text-brand-700 hover:bg-ink-50">Create my free account <ArrowRight className="w-4 h-4" /></Link>
                <a href="mailto:hello@clinix.app" className="btn-lg bg-white/10 text-white hover:bg-white/20 border border-white/30">Talk to an advisor</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="card-glass overflow-hidden p-0 shadow-card">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-ink-200/60 bg-white/50">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs font-mono text-ink-500">app.clinix.health</span>
      </div>
      <div className="p-5 bg-white">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { l: "Appts today", v: "47", t: "+12%" },
            { l: "Revenue", v: "$12.4k", t: "+8%" },
            { l: "Occupancy", v: "92%", t: "+4%" },
          ].map((k) => (
            <div key={k.l} className="rounded-xl border border-ink-200 p-3">
              <div className="text-[10px] uppercase text-ink-500 font-semibold">{k.l}</div>
              <div className="text-xl font-extrabold mt-1">{k.v}</div>
              <div className="text-[10px] text-emerald-600 font-bold">{k.t}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-ink-200 p-3">
          <div className="text-xs font-semibold text-ink-700 mb-2">Schedule · Today</div>
          {[
            { h: "09:00", n: "Maria González", d: "Dr. Pérez · Cardiology", c: "bg-brand-500" },
            { h: "09:30", n: "Carlos Ruiz", d: "Dr. López · Pediatrics", c: "bg-accent-500" },
            { h: "10:15", n: "Ana Martínez", d: "Dr. Pérez · Cardiology", c: "bg-emerald-500" },
            { h: "11:00", n: "Luis Sánchez", d: "Dr. López · Pediatrics", c: "bg-amber-500" },
          ].map((r) => (
            <div key={r.h} className="flex items-center gap-3 py-2 border-t border-ink-100 first:border-0">
              <span className={`w-1 h-8 rounded-full ${r.c}`} />
              <span className="text-xs font-mono text-ink-500 w-12">{r.h}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{r.n}</div>
                <div className="text-xs text-ink-500 truncate">{r.d}</div>
              </div>
              <span className="badge-green text-[10px]">Confirmed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
