import { useI18n } from "../../i18n";

export default function MarketingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="container-wide py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient" />
            <span className="font-display text-lg font-extrabold">Clinix</span>
          </div>
          <p className="text-ink-500 max-w-xs">{t("landing.hero.subtitle")}</p>
        </div>
        <div>
          <div className="font-semibold text-ink-800 mb-3">{t("landing.features.title")}</div>
          <ul className="space-y-2 text-ink-600">
            <li><a href="#features" className="hover:text-ink-900">{t("landing.features.title")}</a></li>
            <li><a href="#pricing" className="hover:text-ink-900">{t("landing.pricing.title")}</a></li>
            <li><a href="#compliance" className="hover:text-ink-900">Security</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-ink-800 mb-3">Company</div>
          <ul className="space-y-2 text-ink-600">
            <li><a href="mailto:hello@clinix.app" className="hover:text-ink-900">Contact</a></li>
            <li><a href="#testimonials" className="hover:text-ink-900">Case studies</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-ink-800 mb-3">Legal</div>
          <ul className="space-y-2 text-ink-600">
            <li><a href="/legal/privacy" className="hover:text-ink-900">Privacy</a></li>
            <li><a href="/legal/terms" className="hover:text-ink-900">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-200">
        <div className="container-wide py-5 flex flex-col md:flex-row justify-between text-xs text-ink-500">
          <span>© {new Date().getFullYear()} Clinix Health Systems. All rights reserved.</span>
          <span>Made with ♥ for healthcare professionals.</span>
        </div>
      </div>
    </footer>
  );
}
