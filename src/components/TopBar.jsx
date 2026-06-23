import React from "react";
import { Search, ArrowLeft, Menu, Bell } from "lucide-react";
import { useTh, useT } from "../contexts";

// Yuxarı bar — kontekstual başlıq və axtarış.
// `route.view`-ə görə eyebrow/title dəyişir.
export function TopBar({ route, setRoute, onMenu }) {
  const { theme } = useTh();
  const { t } = useT();

  const titles = {
    dashboard: { eyebrow: t("top_workspace"), title: t("top_dashboard") },
    library: { eyebrow: t("top_catalog"), title: t("top_positions") },
    analyze: { eyebrow: t("top_chrono"), title: t("top_analysis") },
    report: { eyebrow: t("top_final"), title: t("top_report") },
    admin: { eyebrow: "Admin", title: t("top_admin") },
  };
  const meta = titles[route.view] || titles.dashboard;

  return (
    <header className="px-4 md:px-8 py-4 flex items-center justify-between gap-2"
      style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobil hamburger */}
        <button onClick={onMenu} className="lg:hidden p-1.5" style={{ color: theme.text }}>
          <Menu size={18} />
        </button>

        {/* Analiz görünüşündə "geri" düyməsi */}
        {route.view === "analyze" && (
          <button onClick={() => setRoute({ view: "library" })} className="p-1.5 hidden md:block" style={{ color: theme.text }}>
            <ArrowLeft size={16} />
          </button>
        )}

        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.12em] truncate" style={{ color: theme.textMuted }}>{meta.eyebrow}</div>
          <h1 className="text-base md:text-xl font-medium mt-0.5 truncate">{meta.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Axtarış (desktop only) */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
          <input placeholder={t("top_search")} className="pl-9 pr-3 py-2 text-sm w-48 lg:w-64 focus:outline-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} />
        </div>
        <button className="p-2 hidden sm:block" style={{ border: `1px solid ${theme.border}`, color: theme.text }}>
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}

// Səhifə altlığı
export function Footer() {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <footer className="px-4 md:px-8 py-3 text-[10px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1"
      style={{ background: theme.surface, borderTop: `1px solid ${theme.border}`, color: theme.textMuted }}>
      <span>{t("footer_meta")}</span>
      <span className="hidden sm:inline">{t("footer_integ")}</span>
    </footer>
  );
}
