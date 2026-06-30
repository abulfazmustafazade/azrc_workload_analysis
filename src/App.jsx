import React, { useState } from "react";
import { ThemeCtx, LangCtx, AuthCtx } from "./contexts";
import { THEMES } from "./theme";
import { TRANSLATIONS } from "./i18n";
import { INITIAL_USERS, INITIAL_ROLES, INITIAL_STRUCTURE, INITIAL_ANALYSES, INITIAL_AUDIT_LOG } from "./seed";
import { uuid } from "./lib";
import { Login } from "./components/Login";
import { AppShell } from "./components/AppShell";

// Bütün tətbiqin kök komponenti.
// State management strategiyası: bütün state burada saxlanılır və context-lərlə paylanır.
// Supabase qoşulduqda bu state-ləri müvafiq async fetch-lərlə əvəz edəcəksiniz.
export default function App() {
  // UI state
  const [lang, setLang] = useState("az");
  const [dark, setDark] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  // Domen state — Supabase-də cədvəllərə uyğundur
  const [users, setUsers] = useState(INITIAL_USERS);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [structure, setStructure] = useState(INITIAL_STRUCTURE);
  const [analyses, setAnalyses] = useState(INITIAL_ANALYSES);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);

  const theme = dark ? THEMES.dark : THEMES.light;
  const t = (k) => TRANSLATIONS[lang][k] || k;

  // Audit jurnalına yeni qeyd əlavə et
  const pushAudit = (action, target) => {
    if (!currentUser) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setAuditLog((log) => [
      { id: uuid(), at: now, actor: currentUser.full_name, action, target },
      ...log,
    ]);
  };

  // RBAC helperləri — cari istifadəçinin rolu və scope-una əsaslanır
  const userRole = currentUser ? roles.find((r) => r.id === currentUser.role_id) : null;
  const can = (perm) => userRole?.permissions?.includes(perm) || false;

  // Scope yoxlaması: deptName ya "Department" adı (geriyə uyğunluq), ya da
  // pathNames massivi ilə çağırılırsa (hər hansı node ata zənciri), zəncirdəki
  // istənilən adın scope-da olması kifayətdir.
  const inScope = (deptNameOrPath) => {
    if (!currentUser) return false;
    if (currentUser.scope === "all") return true;
    if (!Array.isArray(currentUser.scope)) return false;
    if (Array.isArray(deptNameOrPath)) {
      return deptNameOrPath.some((n) => currentUser.scope.includes(n));
    }
    return currentUser.scope.includes(deptNameOrPath);
  };

  // Auth context-i — bütün state və helperlər bir yerdə
  const authValue = {
    currentUser, setCurrentUser,
    users, setUsers,
    roles, setRoles,
    structure, setStructure,
    analyses, setAnalyses,
    auditLog, pushAudit,
    can, inScope, userRole,
  };

  return (
    <ThemeCtx.Provider value={{ theme, dark, setDark }}>
      <LangCtx.Provider value={{ lang, setLang, t }}>
        <AuthCtx.Provider value={authValue}>
          <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh" }}>
            {!currentUser ? <Login /> : <AppShell />}
          </div>
        </AuthCtx.Provider>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
