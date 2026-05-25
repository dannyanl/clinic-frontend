import { useState } from "react";
import {
  LayoutGrid, Stethoscope, MapPin, Users, ClipboardList,
  Star, MessageSquare, Bell, Trash2, Shield, Building2, FileCheck,
} from "lucide-react";

import SpecialtiesTab from "./tabs/SpecialtiesTab";
import LocationsTab from "./tabs/LocationsTab";
import UsersTab from "./tabs/UsersTab";
import ActivityTab from "./tabs/ActivityTab";
import BrandingTab from "./tabs/BrandingTab";
import NpsTab from "./tabs/NpsTab";
import TemplatesTab from "./tabs/TemplatesTab";
import RemindersTab from "./tabs/RemindersTab";
import TrashTab from "./tabs/TrashTab";
import GdprTab from "./tabs/GdprTab";
import TenantsTab from "./tabs/TenantsTab";
import ConsentTemplatesTab from "./tabs/ConsentTemplatesTab";
import { useI18n } from "../../i18n";

export default function AdminPanel() {
  const { t } = useI18n();
  const [tab, setTab] = useState("specialties");

  const TABS = [
    { id: "specialties", label: t("admin.tab.specialties"), icon: Stethoscope },
    { id: "locations", label: t("admin.tab.locations"), icon: MapPin },
    { id: "users", label: t("admin.tab.users"), icon: Users },
    { id: "consents", label: t("consents.title"), icon: FileCheck },
    { id: "templates", label: "Templates", icon: MessageSquare },
    { id: "reminders", label: t("admin.tab.reminders"), icon: Bell },
    { id: "nps", label: t("admin.tab.nps"), icon: Star },
    { id: "gdpr", label: t("admin.tab.gdpr"), icon: Shield },
    { id: "trash", label: "Trash", icon: Trash2 },
    { id: "tenants", label: "Tenants", icon: Building2 },
    { id: "activity", label: "Activity", icon: ClipboardList },
    { id: "settings", label: t("admin.tab.branding"), icon: LayoutGrid },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <LayoutGrid className="w-6 h-6 text-brand-600" />
          <h1 className="text-3xl font-extrabold">{t("admin.title")}</h1>
        </div>
        <p className="text-sm text-ink-500">{t("admin.title")}</p>
      </header>

      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex gap-1 bg-ink-100 p-1 rounded-2xl w-fit min-w-full md:min-w-0 flex-nowrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                tab === id ? "bg-white shadow-sm text-brand-700" : "text-ink-600 hover:text-ink-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        {tab === "specialties" && <SpecialtiesTab />}
        {tab === "locations" && <LocationsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "consents" && <ConsentTemplatesTab />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "reminders" && <RemindersTab />}
        {tab === "nps" && <NpsTab />}
        {tab === "gdpr" && <GdprTab />}
        {tab === "trash" && <TrashTab />}
        {tab === "tenants" && <TenantsTab />}
        {tab === "activity" && <ActivityTab />}
        {tab === "settings" && <BrandingTab />}
      </div>
    </div>
  );
}
