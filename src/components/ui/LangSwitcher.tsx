import { Globe } from 'lucide-react'
import { useI18n, SUPPORTED_LANGS } from '../../i18n'

export default function LangSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-ink-600 hover:bg-ink-100 transition"
        title="Change language"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase">{lang}</span>
      </button>
      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 min-w-[140px]">
        <div className="bg-white border border-ink-200 rounded-xl shadow-lg p-1">
          {SUPPORTED_LANGS.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left ${
                lang === code
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
