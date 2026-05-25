import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useI18n } from "../../i18n";

export default function MarketingNav() {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/75 border-b border-ink-200/60">
      <div className="container-wide flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow-md group-hover:shadow-lg transition">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div className="font-display text-xl font-extrabold tracking-tight">Clinix</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-600">
          <a href="#features" className="hover:text-ink-900">{t("landing.features.title")}</a>
          <a href="#pricing" className="hover:text-ink-900">{t("landing.pricing.title")}</a>
          <a href="#testimonials" className="hover:text-ink-900">Testimonials</a>
          <a href="#compliance" className="hover:text-ink-900">Compliance</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard" className="btn-gradient btn-sm">{t("nav.dashboard")}</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm">{t("landing.hero.login")}</Link>
              <Link to="/register" className="btn-gradient btn-sm">{t("landing.hero.cta")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
