import React from "react";
import {
  Activity, LayoutGrid, FolderOpen, FileBarChart, Shield,
  Languages, Sun, Moon, LogOut, X
} from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";

// Sol nav paneli — desktop-da statik, mobil-də drawer.
// Nav itemləri istifadəçinin icazələrinə görə avtomatik filtrlənir.
export function Sidebar({ route, setRoute, onClose }) {
  const { theme, dark, setDark } = useTh();
  const { t, lang, setLang } = useT();
  const { currentUser, can, userRole, setCurrentUser, pushAudit } = useAuth();

  // Yalnız icazəsi olan nav itemlərini göstər
  const items = [
    { id: "dashboard", label: t("nav_dashboard"), icon: LayoutGrid, perm: "dashboard.view" },
    { id: "library", label: t("nav_library"), icon: FolderOpen, perm: "library.view" },
    { id: "report", label: t("nav_report"), icon: FileBarChart, perm: "report.view" },
  ].filter((i) => can(i.perm));

  // Admin nav yalnız hər hansı admin icazəsi olduqda görünür
  const adminVisible = ["admin.users", "admin.roles", "admin.structure", "admin.audit"].some((p) => can(p));

  const logout = () => {
    pushAudit("audit_logout", currentUser.email);
    setCurrentUser(null);
  };

  return (
    <aside className="w-64 min-h-screen p-5 flex flex-col" style={{ background: theme.sidebar, color: theme.sidebarText }}>
      {/* Brend + bağla düyməsi (mobil) */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: theme.accent }}>
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-tight">YÜKAY</div>
            <div className="text-[10px] tracking-[0.15em] uppercase" style={{ opacity: 0.6 }}>{t("brand_tagline")}</div>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="text-white"><X size={18} /></button>}
      </div>

      {/* Əsas naviqasiya */}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = route.view === item.id;
          return (
            <button key={item.id} onClick={() => setRoute({ view: item.id })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm"
              style={{
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                color: active ? "#fff" : theme.sidebarText,
              }}>
              <Icon size={15} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin bölməsi (yalnız admin icazəsi olanlara) */}
      {adminVisible && (
        <>
          <div className="text-[10px] uppercase tracking-wider mt-6 mb-2 px-3" style={{ opacity: 0.4 }}>Admin</div>
          <nav className="space-y-0.5">
            <button onClick={() => setRoute({ view: "admin" })}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm"
              style={{
                background: route.view === "admin" ? "rgba(255,255,255,0.08)" : "transparent",
                color: route.view === "admin" ? "#fff" : theme.sidebarText,
              }}>
              <Shield size={15} />
              <span className="flex-1 text-left">{t("nav_admin")}</span>
            </button>
          </nav>
        </>
      )}

      <div className="flex-1" />

      {/* Dil və mövzu dəyişdiriciləri */}
      <div className="pt-4 mt-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => setLang(lang === "az" ? "en" : "az")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px]"
            style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}>
            <Languages size={12} /> {lang.toUpperCase()}
          </button>
          <button onClick={() => setDark(!dark)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px]"
            style={{ background: "rgba(255,255,255,0.06)", color: "#fff" }}>
            {dark ? <Sun size={12} /> : <Moon size={12} />}
            {dark ? t("theme_light") : t("theme_dark")}
          </button>
        </div>
      </div>

      {/* Cari istifadəçi + çıxış */}
      <div className="pt-4 mt-4 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-8 h-8 flex items-center justify-center font-medium" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
          {currentUser.full_name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white truncate">{currentUser.full_name}</div>
          <div className="text-[10px]" style={{ opacity: 0.5 }}>{lang === "az" ? userRole?.name_az : userRole?.name_en}</div>
        </div>
        <button onClick={logout} style={{ color: theme.sidebarText, opacity: 0.6 }}><LogOut size={13} /></button>
      </div>
    </aside>
  );
}
