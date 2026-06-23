import React from "react";
import {
  LayoutGrid, FolderOpen, FileBarChart, Shield,
  Languages, Sun, Moon, LogOut, X, ChevronRight
} from "lucide-react";
import { useTh, useT, useAuth } from "../contexts";
import { AzerconnectLogo } from "./shared";

export function Sidebar({ route, setRoute, onClose }) {
  const { theme, dark, setDark } = useTh();
  const { t, lang, setLang } = useT();
  const { currentUser, can, userRole, setCurrentUser, pushAudit, analyses, structure } = useAuth();

  const items = [
    { id: "dashboard", label: t("nav_dashboard"), icon: LayoutGrid, perm: "dashboard.view" },
    { id: "library",   label: t("nav_library"),   icon: FolderOpen,  perm: "library.view" },
    { id: "report",    label: t("nav_report"),     icon: FileBarChart, perm: "report.view" },
  ].filter((i) => can(i.perm));

  const adminVisible = ["admin.users","admin.roles","admin.structure","admin.audit"].some(p => can(p));

  const logout = () => {
    pushAudit("audit_logout", currentUser.email);
    setCurrentUser(null);
  };

  const completedCount = Object.values(analyses).filter(a => a.status === "completed").length;
  const totalPositions = structure.reduce((s,d) => s + d.units.reduce((u,un) => u + un.positions.length,0), 0);

  return (
    <aside className="w-64 min-h-screen flex flex-col"
           style={{ background: theme.sidebar, borderRight: `1px solid rgba(255,255,255,0.05)` }}>

      {/* Logo + bağla */}
      <div className="px-5 py-5 flex items-center justify-between"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <AzerconnectLogo style={{ height: 28, width: "auto", filter: "brightness(0) invert(1)" }} />
        {onClose && (
          <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tətbiq adı */}
      <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white">YÜKAY</div>
        <div className="text-[9px] tracking-[0.1em] uppercase mt-0.5"
             style={{ color: theme.sidebarText, opacity: 0.5 }}>
          Workload Intelligence
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-3 space-y-0.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = route.view === item.id;
          return (
            <button key={item.id} onClick={() => setRoute({ view: item.id })}
                    className="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm"
                    style={{
                      background: active ? "rgba(255,255,255,0.1)" : "transparent",
                      color: active ? "#fff" : theme.sidebarText,
                      borderRadius: 2,
                      borderLeft: active ? `2px solid #2A8A4E` : "2px solid transparent",
                    }}>
              <Icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
              <span className="flex-1 text-left text-[13px] font-medium">{item.label}</span>
              {active && <div className="w-1 h-1 rounded-full" style={{ background: "#2A8A4E" }} />}
            </button>
          );
        })}

        {/* Admin bölməsi */}
        {adminVisible && (
          <>
            <div className="px-3 pt-4 pb-1">
              <div className="text-[9px] uppercase tracking-[0.15em] font-semibold"
                   style={{ color: "rgba(255,255,255,0.25)" }}>
                Admin
              </div>
            </div>
            <button onClick={() => setRoute({ view: "admin" })}
                    className="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm"
                    style={{
                      background: route.view === "admin" ? "rgba(255,255,255,0.1)" : "transparent",
                      color: route.view === "admin" ? "#fff" : theme.sidebarText,
                      borderRadius: 2,
                      borderLeft: route.view === "admin" ? `2px solid #2A8A4E` : "2px solid transparent",
                    }}>
              <Shield size={15} style={{ opacity: route.view === "admin" ? 1 : 0.7 }} />
              <span className="flex-1 text-left text-[13px] font-medium">{t("nav_admin")}</span>
              {route.view === "admin" && <div className="w-1 h-1 rounded-full" style={{ background: "#2A8A4E" }} />}
            </button>
          </>
        )}
      </nav>

      {/* Tərəqqi */}
      <div className="px-5 py-3 mx-3 mb-2"
           style={{ background: "rgba(255,255,255,0.04)", borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex justify-between text-[10px] mb-1.5"
             style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>Analiz tərəqqisi</span>
          <span className="tabular-nums font-medium text-white">
            {completedCount}/{totalPositions}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full progress-bar rounded-full"
               style={{ width: `${totalPositions ? (completedCount/totalPositions)*100 : 0}%`,
                        background: "linear-gradient(90deg, #1E6B3C, #2A8A4E)" }} />
        </div>
      </div>

      {/* Dil + mövzu */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === "az" ? "en" : "az")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
                           borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Languages size={11} /> {lang.toUpperCase()}
          </button>
          <button onClick={() => setDark(!dark)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
                           borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)" }}>
            {dark ? <Sun size={11} /> : <Moon size={11} />}
            {dark ? t("theme_light") : t("theme_dark")}
          </button>
        </div>
      </div>

      {/* İstifadəçi */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-2.5"
             style={{ background: "rgba(255,255,255,0.04)", borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
               style={{ background: "linear-gradient(135deg, #0B3D6B, #1E6B3C)", borderRadius: "50%" }}>
            {currentUser.full_name.split(" ").map(s => s[0]).join("").slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{currentUser.full_name}</div>
            <div className="text-[10px] truncate" style={{ color: theme.sidebarText, opacity: 0.6 }}>
              {lang === "az" ? userRole?.name_az : userRole?.name_en}
            </div>
          </div>
          <button onClick={logout} className="p-1 opacity-50 hover:opacity-100"
                  style={{ color: theme.sidebarText }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
