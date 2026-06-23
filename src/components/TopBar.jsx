import React, { useState } from "react";
import { Search, ArrowLeft, Menu, Bell, X } from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { AzerconnectLogo } from "./shared";

export function TopBar({ route, setRoute, onMenu }) {
  const { theme } = useTh();
  const { t } = useT();
  const { can } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const titles = {
    dashboard: { eyebrow: t("top_workspace"),  title: t("top_dashboard") },
    library:   { eyebrow: t("top_catalog"),    title: t("top_positions") },
    analyze:   { eyebrow: t("top_chrono"),     title: t("top_analysis") },
    report:    { eyebrow: t("top_final"),      title: t("top_report") },
    admin:     { eyebrow: "Admin",             title: t("top_admin") },
  };
  const meta = titles[route.view] || titles.dashboard;

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-14 flex-shrink-0"
            style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>

      {/* Mobil hamburger */}
      <button onClick={onMenu} className="lg:hidden p-2 -ml-1" style={{ color: theme.textMuted }}>
        <Menu size={18} />
      </button>

      {/* Mobil logo */}
      <div className="lg:hidden flex-shrink-0">
        <AzerconnectLogo style={{ height: 22, width: "auto" }} />
      </div>

      {/* Geri (analiz) */}
      {route.view === "analyze" && (
        <button onClick={() => setRoute({ view: "library" })}
                className="hidden md:flex items-center gap-1.5 text-xs font-medium mr-1 px-2.5 py-1.5"
                style={{ border: `1px solid ${theme.border}`, color: theme.textMuted,
                         borderRadius: 2 }}>
          <ArrowLeft size={12} /> {t("nav_library")}
        </button>
      )}

      {/* Breadcrumb başlıq */}
      <div className="hidden lg:block min-w-0 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-medium mb-0.5"
             style={{ color: theme.textDim }}>
          <span>YÜKAY</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: theme.accent }}>{meta.eyebrow}</span>
        </div>
        <h1 className="text-sm font-semibold truncate" style={{ color: theme.text }}>
          {meta.title}
        </h1>
      </div>

      <div className="flex-1" />

      {/* Axtarış — mobil açılır, desktop həmişə görünür */}
      {searchOpen ? (
        <div className="flex items-center gap-2 flex-1 max-w-xs fade-in">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: theme.textDim }} />
            <input autoFocus placeholder={t("top_search")}
                   className="w-full pl-8 pr-3 py-2 text-xs"
                   style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                            color: theme.text, borderRadius: 2 }} />
          </div>
          <button onClick={() => setSearchOpen(false)} style={{ color: theme.textMuted }}>
            <X size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: theme.textDim }} />
            <input placeholder={t("top_search")}
                   className="pl-8 pr-3 py-2 text-xs w-48 lg:w-60"
                   style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                            color: theme.text, borderRadius: 2 }} />
          </div>
          <button onClick={() => setSearchOpen(true)} className="md:hidden p-2"
                  style={{ color: theme.textMuted }}>
            <Search size={16} />
          </button>
        </>
      )}

      {/* Bildiriş */}
      <button className="relative p-2"
              style={{ border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: 2 }}>
        <Bell size={15} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: theme.accent }} />
      </button>
    </header>
  );
}

export function Footer() {
  const { theme } = useTh();
  const { t } = useT();
  return (
    <footer className="px-4 md:px-6 py-2.5 flex items-center justify-between"
            style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-3">
        <AzerconnectLogo style={{ height: 16, width: "auto", opacity: 0.5 }} />
        <span className="text-[10px]" style={{ color: theme.textDim }}>{t("footer_meta")}</span>
      </div>
      <span className="hidden sm:inline text-[10px]" style={{ color: theme.textDim }}>
        {t("footer_integ")}
      </span>
    </footer>
  );
}
