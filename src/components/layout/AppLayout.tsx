import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, LayoutDashboard, Stethoscope, Users, BarChart3, ShieldCheck,
  LogOut, FileText, CreditCard, KeyRound, Menu, FileLock2, Download, FileSearch,
  Package, Shield, Clock, Search, Calendar, User, ChevronDown, Bell,
  Globe, FileCheck, CalendarClock, Heart, HelpCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../i18n";
import LangSwitcher from "../ui/LangSwitcher";
import type { Role } from "../../types";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const role = (user?.role ?? "patient") as Role;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const close = () => setMobileOpen(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
    }
  }

  const MAIN_NAV = [
    { to: "/dashboard",       labelKey: "nav.dashboard",      icon: LayoutDashboard,  roles: ["superadmin","admin","doctor","receptionist","patient"] as Role[] },
    { to: "/appointments",    labelKey: "nav.appointments",   icon: CalendarDays,     roles: ["admin","doctor","receptionist","patient"] as Role[] },
    { to: "/calendar",        labelKey: "nav.calendar",       icon: Calendar,         roles: ["admin","doctor","receptionist"] as Role[] },
    { to: "/waiting-room",    labelKey: "nav.waiting_room",   icon: Clock,            roles: ["admin","doctor","receptionist"] as Role[] },
    { to: "/my-schedule",     labelKey: "nav.my_schedule",    icon: CalendarClock,    roles: ["doctor"] as Role[] },
    { to: "/doctors",         labelKey: "nav.doctors",        icon: Stethoscope,      roles: ["admin","doctor","receptionist","patient"] as Role[] },
    { to: "/patients",        labelKey: "nav.patients",       icon: Users,            roles: ["admin","doctor","receptionist"] as Role[] },
    { to: "/medical-records", labelKey: "nav.records",        icon: FileText,         roles: ["admin","doctor","patient"] as Role[] },
    { to: "/consents",        labelKey: "nav.consents",       icon: FileCheck,        roles: ["admin","doctor","patient"] as Role[] },
  ] as const;

  const CLINICAL_NAV = [
    { to: "/payments",        labelKey: "nav.payments",       icon: CreditCard,       roles: ["admin","receptionist"] as Role[] },
    { to: "/insurance",       labelKey: "nav.insurance",      icon: Shield,           roles: ["admin","receptionist","patient"] as Role[] },
    { to: "/inventory",       labelKey: "nav.inventory",      icon: Package,          roles: ["admin","receptionist","doctor"] as Role[] },
    { to: "/reports",         labelKey: "nav.reports",        icon: BarChart3,        roles: ["admin","receptionist"] as Role[] },
  ] as const;

  const ADMIN_NAV = [
    { to: "/admin",           labelKey: "nav.admin",          icon: ShieldCheck,      roles: ["admin"] as Role[] },
    { to: "/admin/phi-logs",  labelKey: "nav.phi_audit",      icon: FileSearch,       roles: ["admin"] as Role[] },
    { to: "/roles",           labelKey: "nav.roles",          icon: HelpCircle,       roles: ["admin","doctor","receptionist","patient","superadmin"] as Role[] },
  ] as const;

  const SUPERADMIN_NAV = [
    { to: "/superadmin",      labelKey: "nav.superadmin",     icon: Globe,            roles: ["superadmin"] as Role[] },
    { to: "/roles",           labelKey: "nav.roles",          icon: HelpCircle,       roles: ["superadmin"] as Role[] },
  ] as const;

  const ACCOUNT_NAV = [
    { to: "/profile",             labelKey: "nav.profile",   icon: User },
    { to: "/account/2fa",         labelKey: "nav.2fa",       icon: KeyRound },
    { to: "/account/policies",    labelKey: "nav.policies",  icon: FileLock2 },
    { to: "/account/data",        labelKey: "nav.my_data",   icon: Download },
  ] as const;

  const ROLE_LABEL: Record<Role, string> = {
    superadmin: t("role.superadmin"),
    admin: t("role.admin"),
    doctor: t("role.doctor"),
    receptionist: t("role.receptionist"),
    patient: t("role.patient"),
  };

  const ROLE_BADGE: Record<Role, string> = {
    superadmin: "bg-amber-100 text-amber-800",
    admin: "bg-accent-100 text-accent-700",
    doctor: "bg-brand-100 text-brand-700",
    receptionist: "bg-emerald-100 text-emerald-700",
    patient: "bg-rose-100 text-rose-700",
  };

  const filteredMain = MAIN_NAV.filter((i) => (i.roles as readonly Role[]).includes(role));
  const filteredClinical = CLINICAL_NAV.filter((i) => (i.roles as readonly Role[]).includes(role));
  const filteredAdmin = role === "superadmin"
    ? SUPERADMIN_NAV.filter((i) => (i.roles as readonly Role[]).includes(role))
    : ADMIN_NAV.filter((i) => (i.roles as readonly Role[]).includes(role));

  function NavItem({ to, labelKey, icon: Icon, onClick }: { to: string; labelKey: string; icon: React.FC<any>; onClick?: () => void }) {
    return (
      <NavLink to={to} onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isActive ? "bg-brand-50 text-brand-700 shadow-sm" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
          }`
        }>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{t(labelKey as any)}</span>
      </NavLink>
    );
  }

  const mainSectionLabel = role === "patient"
    ? t("nav.section.main.patient")
    : role === "doctor"
    ? t("nav.section.main.doctor")
    : t("nav.section.main.other");

  const Sidebar = (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-ink-200
      flex flex-col transform transition-transform lg:translate-x-0
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-ink-200 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5" onClick={close}>
          <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-tight tracking-tight">Clinix</div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider">Health Suite</div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 flex-shrink-0">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-2 bg-ink-100 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
            <input className="bg-transparent flex-1 text-sm outline-none placeholder:text-ink-400"
              placeholder={t("common.search_placeholder")}
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
          </div>
        </form>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase text-ink-400 px-3 pb-1.5 tracking-wider">
            {mainSectionLabel}
          </div>
          <div className="space-y-0.5">
            {filteredMain.map((i) => <NavItem key={i.to} {...i} onClick={close} />)}
          </div>
        </div>

        {filteredClinical.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase text-ink-400 px-3 pb-1.5 tracking-wider">
              {t("nav.section.operations")}
            </div>
            <div className="space-y-0.5">
              {filteredClinical.map((i) => <NavItem key={i.to} {...i} onClick={close} />)}
            </div>
          </div>
        )}

        {filteredAdmin.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase text-ink-400 px-3 pb-1.5 tracking-wider">
              {role === "superadmin" ? t("nav.section.platform") : t("nav.section.system")}
            </div>
            <div className="space-y-0.5">
              {filteredAdmin.map((i) => <NavItem key={i.to} {...i} onClick={close} />)}
            </div>
          </div>
        )}
      </nav>

      {/* User panel */}
      <div className="p-3 border-t border-ink-200 flex-shrink-0">
        <button onClick={() => setAccountOpen(!accountOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ink-50 transition">
          <div className={`w-9 h-9 rounded-full grid place-items-center text-white font-bold text-sm flex-shrink-0
            ${role === "superadmin" ? "bg-gradient-to-br from-amber-500 to-orange-600" :
              role === "admin" ? "bg-accent-gradient" :
              role === "doctor" ? "bg-brand-gradient" :
              role === "receptionist" ? "bg-gradient-to-br from-emerald-500 to-emerald-700" :
              "bg-gradient-to-br from-rose-500 to-rose-700"}`}>
            {(user?.full_name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-sm font-semibold truncate">{user?.full_name ?? user?.email}</div>
            <div className={`text-xs px-1.5 py-0.5 rounded-md inline-block mt-0.5 font-medium ${ROLE_BADGE[role]}`}>
              {ROLE_LABEL[role]}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
        </button>

        {accountOpen && (
          <div className="mt-2 space-y-0.5">
            {ACCOUNT_NAV.map(({ to, labelKey, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive ? "bg-accent-50 text-accent-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                  }`}>
                <Icon className="w-3.5 h-3.5" /> {t(labelKey as any)}
              </NavLink>
            ))}
            <button onClick={() => { signOut(); close(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition">
              <LogOut className="w-3.5 h-3.5" /> {t("auth.logout")}
            </button>
          </div>
        )}

        {/* Language switcher */}
        <div className="mt-2 px-1">
          <LangSwitcher />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-ink-50">
      {Sidebar}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden" onClick={close} />}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-ink-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="btn-ghost btn-sm" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-extrabold">Clinix</span>
            <div className="flex gap-1">
              <Link to="/search" className="btn-ghost btn-sm"><Search className="w-4 h-4" /></Link>
              <button className="btn-ghost btn-sm" onClick={signOut}><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
