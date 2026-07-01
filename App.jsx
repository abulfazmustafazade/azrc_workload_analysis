import React, { useState, useEffect, useCallback, useRef } from "react";
import { ThemeCtx, LangCtx, AuthCtx, ToastCtx } from "./contexts";
import { THEMES } from "./theme";
import { TRANSLATIONS } from "./i18n";
import { supabase } from "./supabase";
import { authApi, rolesApi, usersApi, structureApi, analysesApi, auditApi } from "./db";
import { Login } from "./components/Login";
import { AppShell } from "./components/AppShell";
import { AzerconnectLogo, ToastContainer } from "./components/shared";

// ============================================================================
// Kök komponent — Supabase-dən data yüklənir.
// Admin komponentləri DB-yə birbaşa yazır, sonra reloadData() çağırır.
// setStructure/setAnalyses yalnız READ üçün istifadə olunur (optimistic display).
// ============================================================================
export default function App() {
  const [lang, setLang] = useState("az");
  const [dark, setDark] = useState(false);
  const [currentUser, setCurrentUserState] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [structure, setStructure] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [auditLog, setAuditLog] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Toast state
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const addToast = useCallback((message, type = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const currentUserIdRef = useRef(null);
  const theme = dark ? THEMES.dark : THEMES.light;
  const t = (k) => TRANSLATIONS[lang][k] || k;

  // --------------------------------------------------------------------------
  // Data yüklə
  // --------------------------------------------------------------------------
  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");
    try {
      const [rolesData, usersData, structureData, analysesData, auditData] = await Promise.all([
        rolesApi.list(),
        usersApi.list(),
        structureApi.getTree(),
        analysesApi.listAll(),
        auditApi.list(),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
      setStructure(structureData);
      setAnalyses(analysesData);
      setAuditLog(auditData);
    } catch (err) {
      console.error("[YÜKAY] Data yüklənmə xətası:", err);
      setLoadError(err.message || "Verilənlər yüklənmədi");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Auth
  // --------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await authApi.getCurrentProfile();
        if (mounted) { setCurrentUserState(profile); currentUserIdRef.current = profile?.id || null; }
        if (profile) await loadAllData();
      } catch { /* sessiya yoxdur */ }
      finally { if (mounted) setAuthChecked(true); }
    })();

    const { data: sub } = authApi.onAuthStateChange(async (authUser) => {
      if (!authUser) { setCurrentUserState(null); currentUserIdRef.current = null; return; }
      try {
        const profile = await authApi.getCurrentProfile();
        const isNew = currentUserIdRef.current !== profile?.id;
        setCurrentUserState(profile);
        currentUserIdRef.current = profile?.id || null;
        if (profile) {
          await loadAllData();
          if (isNew) auditApi.log("login", profile.email).catch(() => {});
        }
      } catch (err) { console.error("[YÜKAY] Profil yüklənmədi:", err); }
    });

    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, [loadAllData]);

  // --------------------------------------------------------------------------
  // Audit — DB-yə yaz + optimistic local əlavə
  // --------------------------------------------------------------------------
  const pushAudit = useCallback((action, target) => {
    if (!currentUser) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setAuditLog((log) => [
      { id: "tmp_" + Date.now(), at: now, actor: currentUser.full_name, action, target },
      ...log,
    ]);
    auditApi.log(action.replace(/^audit_/, ""), target).catch(() => {});
  }, [currentUser]);

  // --------------------------------------------------------------------------
  // Logout
  // --------------------------------------------------------------------------
  const setCurrentUser = useCallback((user) => {
    if (user === null) {
      authApi.signOut().catch(() => {});
      setCurrentUserState(null);
      currentUserIdRef.current = null;
    } else {
      setCurrentUserState(user);
      currentUserIdRef.current = user?.id || null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // RBAC
  // --------------------------------------------------------------------------
  const userRole = currentUser ? roles.find((r) => r.id === currentUser.role_id) : null;
  const can = (perm) => userRole?.permissions?.includes(perm) || false;

  const inScope = (deptNameOrPath) => {
    if (!currentUser) return false;
    if (currentUser.scope === "all") return true;
    if (!Array.isArray(currentUser.scope)) return false;
    if (Array.isArray(deptNameOrPath)) return deptNameOrPath.some((n) => currentUser.scope.includes(n));
    return currentUser.scope.includes(deptNameOrPath);
  };

  const authValue = {
    currentUser, setCurrentUser,
    users, setUsers,
    roles, setRoles,
    structure, setStructure,
    analyses, setAnalyses,
    auditLog, pushAudit,
    can, inScope, userRole,
    reloadData: loadAllData,
    addToast,
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  if (!authChecked) {
    return (
      <ThemeCtx.Provider value={{ theme, dark, setDark }}>
        <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
          <div className="flex flex-col items-center gap-3">
            <AzerconnectLogo style={{ height: 36 }} />
            <div className="text-xs" style={{ color: theme.textMuted }}>Yüklənir...</div>
          </div>
        </div>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ theme, dark, setDark }}>
      <LangCtx.Provider value={{ lang, setLang, t }}>
        <ToastCtx.Provider value={{ addToast }}>
          <AuthCtx.Provider value={authValue}>
            <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh" }}>
              {!currentUser ? (
                <Login />
              ) : loadingData && structure.length === 0 ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <AzerconnectLogo style={{ height: 32 }} />
                    <div className="text-xs" style={{ color: theme.textMuted }}>Məlumatlar yüklənir...</div>
                  </div>
                </div>
              ) : loadError ? (
                <div className="min-h-screen flex items-center justify-center px-4">
                  <div className="max-w-sm text-center">
                    <div className="text-sm font-medium mb-2" style={{ color: theme.danger }}>Verilənlər yüklənmədi</div>
                    <div className="text-xs mb-4" style={{ color: theme.textMuted }}>{loadError}</div>
                    <button onClick={loadAllData} className="px-4 py-2 text-sm font-medium text-white"
                            style={{ background: theme.accent, borderRadius: 2 }}>
                      Yenidən cəhd et
                    </button>
                  </div>
                </div>
              ) : (
                <AppShell />
              )}
              <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
          </AuthCtx.Provider>
        </ToastCtx.Provider>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
