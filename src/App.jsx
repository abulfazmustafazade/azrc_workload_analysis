import React, { useState, useEffect, useCallback, useRef } from "react";
import { ThemeCtx, LangCtx, AuthCtx } from "./contexts";
import { THEMES } from "./theme";
import { TRANSLATIONS } from "./i18n";
import { supabase } from "./supabase";
import { authApi, rolesApi, usersApi, structureApi, analysesApi, auditApi } from "./db";
import { Login } from "./components/Login";
import { AppShell } from "./components/AppShell";
import { AzerconnectLogo } from "./components/shared";

// ============================================================================
// Kök komponent — bütün state Supabase-dən yüklənir və sinxron saxlanılır.
//
// Strategiya: "optimistic update + DB yaz". Komponentlər əvvəlki kimi
// `setStructure(yeniAğac)`, `setUsers(yeniSiyahı)` və s. çağırır — bu hook-lar
// həm local state-i dərhal yeniləyir (UI gecikməsiz cavab verir), həm də fərqi
// arxa planda Supabase-ə yazır. Xəta olarsa konsola düşür və (sadəlik üçün)
// son uğurlu DB vəziyyəti növbəti tam-yeniləmədə bərpa olunur.
// ============================================================================
export default function App() {
  const [lang, setLang] = useState("az");
  const [dark, setDark] = useState(false);

  const [currentUser, setCurrentUserState] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [users, setUsersState] = useState([]);
  const [roles, setRolesState] = useState([]);
  const [structure, setStructureState] = useState([]);
  const [analyses, setAnalysesState] = useState({});
  const [auditLog, setAuditLogState] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Əvvəlki structure/users referansını saxlayır ki, dəyişikliyi DB-yə yazarkən
  // diff çıxara bilək (sadə yanaşma: dəyişən sahələri tapıb müvafiq API çağırışı edirik)
  const prevStructureRef = useRef([]);
  const prevUsersRef = useRef([]);
  const prevRolesRef = useRef([]);
  const currentUserIdRef = useRef(null);

  const theme = dark ? THEMES.dark : THEMES.light;
  const t = (k) => TRANSLATIONS[lang][k] || k;

  // --------------------------------------------------------------------------
  // Bütün domen datasını Supabase-dən yükləyir
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
      setRolesState(rolesData);
      setUsersState(usersData);
      setStructureState(structureData);
      setAnalysesState(analysesData);
      setAuditLogState(auditData);
      prevStructureRef.current = structureData;
      prevUsersRef.current = usersData;
      prevRolesRef.current = rolesData;
    } catch (err) {
      console.error("[YÜKAY] Data yüklənmə xətası:", err);
      setLoadError(err.message || "Verilənlər yüklənmədi");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Auth vəziyyətini izləyir — ilk yüklənmə + sessiya dəyişiklikləri
  // --------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const profile = await authApi.getCurrentProfile();
        if (mounted) { setCurrentUserState(profile); currentUserIdRef.current = profile?.id || null; }
        if (profile) await loadAllData();
      } catch {
        // Sessiya yoxdur — login ekranı göstəriləcək
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();

    const { data: sub } = authApi.onAuthStateChange(async (authUser) => {
      if (!authUser) {
        setCurrentUserState(null);
        currentUserIdRef.current = null;
        return;
      }
      try {
        const profile = await authApi.getCurrentProfile();
        const isNewLogin = currentUserIdRef.current !== profile?.id;
        setCurrentUserState(profile);
        currentUserIdRef.current = profile?.id || null;
        if (profile) {
          await loadAllData();
          if (isNewLogin) auditApi.log("login", profile.email).catch(() => {});
        }
      } catch (err) {
        console.error("[YÜKAY] Profil yüklənmədi:", err);
      }
    });

    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, [loadAllData]);

  // --------------------------------------------------------------------------
  // Audit jurnalına yeni qeyd (DB-yə yazır + locale optimistic əlavə edir)
  // --------------------------------------------------------------------------
  const pushAudit = useCallback((action, target) => {
    if (!currentUser) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setAuditLogState((log) => [
      { id: "tmp_" + Date.now(), at: now, actor: currentUser.full_name, action, target },
      ...log,
    ]);
    auditApi.log(action.replace(/^audit_/, ""), target).catch((e) =>
      console.error("[YÜKAY] Audit yazılmadı:", e)
    );
  }, [currentUser]);

  // --------------------------------------------------------------------------
  // setUsers — local state + DB sinxronizasiyası
  // Komponentlər tam yeni array verir; köhnə ilə müqayisə edib fərqi tapırıq.
  // --------------------------------------------------------------------------
  const setUsers = useCallback((updater) => {
    setUsersState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncUsers(prev, next);
      prevUsersRef.current = next;
      return next;
    });
  }, []);

  async function syncUsers(prev, next) {
    const prevIds = new Set(prev.map((u) => u.id));
    const nextIds = new Set(next.map((u) => u.id));

    for (const u of next) {
      if (!prevIds.has(u.id)) {
        // Yeni istifadəçi — id "tmp_" prefiksi ilə gəlir, DB-də əsl id yaranacaq
        try {
          await usersApi.create({
            email: u.email, password: u.tempPassword || crypto.randomUUID().slice(0, 12),
            full_name: u.full_name, role_id: u.role_id, scope: u.scope,
          });
        } catch (err) { console.error("[YÜKAY] İstifadəçi yaradılmadı:", err); }
      } else {
        const old = prev.find((x) => x.id === u.id);
        if (JSON.stringify(old) !== JSON.stringify(u)) {
          try {
            await usersApi.update(u.id, {
              full_name: u.full_name, role_id: u.role_id, scope: u.scope, status: u.status,
            });
          } catch (err) { console.error("[YÜKAY] İstifadəçi yenilənmədi:", err); }
        }
      }
    }
    for (const u of prev) {
      if (!nextIds.has(u.id)) {
        try { await usersApi.remove(u.id); }
        catch (err) { console.error("[YÜKAY] İstifadəçi silinmədi:", err); }
      }
    }
  }

  // --------------------------------------------------------------------------
  // setRoles — local state + DB sinxronizasiyası
  // --------------------------------------------------------------------------
  const setRoles = useCallback((updater) => {
    setRolesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncRoles(prev, next);
      prevRolesRef.current = next;
      return next;
    });
  }, []);

  async function syncRoles(prev, next) {
    const prevIds = new Set(prev.map((r) => r.id));
    const nextIds = new Set(next.map((r) => r.id));

    for (const r of next) {
      if (!prevIds.has(r.id)) {
        try { await rolesApi.create({ name_az: r.name_az, name_en: r.name_en, permissions: r.permissions }); }
        catch (err) { console.error("[YÜKAY] Rol yaradılmadı:", err); }
      } else {
        const old = prev.find((x) => x.id === r.id);
        if (JSON.stringify(old) !== JSON.stringify(r) && !r.system) {
          try { await rolesApi.update(r.id, { name_az: r.name_az, name_en: r.name_en, permissions: r.permissions }); }
          catch (err) { console.error("[YÜKAY] Rol yenilənmədi:", err); }
        }
      }
    }
    for (const r of prev) {
      if (!nextIds.has(r.id)) {
        try { await rolesApi.remove(r.id); }
        catch (err) { console.error("[YÜKAY] Rol silinmədi:", err); }
      }
    }
  }

  // --------------------------------------------------------------------------
  // setStructure — local state + DB sinxronizasiyası (rekursiv ağac diff)
  // --------------------------------------------------------------------------
  const setStructure = useCallback((updater) => {
    setStructureState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncStructure(prev, next);
      prevStructureRef.current = next;
      return next;
    });
  }, []);

  // Ağacı düz Map-ə çevirir: id → { node, parent_id }
  function flattenTree(tree, parentId = null, map = new Map()) {
    tree.forEach((node) => {
      map.set(node.id, { node, parent_id: parentId });
      if (node.children?.length) flattenTree(node.children, node.id, map);
    });
    return map;
  }

  function flattenPositions(tree, map = new Map()) {
    tree.forEach((node) => {
      (node.positions || []).forEach((p) => map.set(p.id, { pos: p, node_id: node.id }));
      if (node.children?.length) flattenPositions(node.children, map);
    });
    return map;
  }

  async function syncStructure(prevTree, nextTree) {
    const prevNodes = flattenTree(prevTree);
    const nextNodes = flattenTree(nextTree);
    const prevPos = flattenPositions(prevTree);
    const nextPos = flattenPositions(nextTree);

    // Node-lar: yarat / yenilə / sil
    for (const [id, { node, parent_id }] of nextNodes) {
      if (!prevNodes.has(id)) {
        try {
          await structureApi.createNode({ parent_id, level: node.level, name_az: node.name_az, name_en: node.name_en });
        } catch (err) { console.error("[YÜKAY] Node yaradılmadı:", err); }
      } else {
        const old = prevNodes.get(id).node;
        if (old.name_az !== node.name_az || old.name_en !== node.name_en) {
          try { await structureApi.updateNode(id, { name_az: node.name_az, name_en: node.name_en }); }
          catch (err) { console.error("[YÜKAY] Node yenilənmədi:", err); }
        }
      }
    }
    for (const [id] of prevNodes) {
      if (!nextNodes.has(id)) {
        try { await structureApi.removeNode(id); }
        catch (err) { console.error("[YÜKAY] Node silinmədi:", err); }
      }
    }

    // Vəzifələr: yarat / yenilə / sil
    for (const [id, { pos, node_id }] of nextPos) {
      if (!prevPos.has(id)) {
        try {
          await structureApi.createPosition(node_id, {
            name_az: pos.name_az, name_en: pos.name_en, stat: pos.stat, salary: pos.salary,
          });
        } catch (err) { console.error("[YÜKAY] Vəzifə yaradılmadı:", err); }
      } else {
        const old = prevPos.get(id).pos;
        if (JSON.stringify(old) !== JSON.stringify(pos)) {
          try {
            await structureApi.updatePosition(id, {
              name_az: pos.name_az, name_en: pos.name_en, stat: pos.stat,
              ehtiyac: pos.ehtiyac, teklif: pos.teklif, qeyd: pos.qeyd, salary: pos.salary,
            });
          } catch (err) { console.error("[YÜKAY] Vəzifə yenilənmədi:", err); }
        }
      }
    }
    for (const [id] of prevPos) {
      if (!nextPos.has(id)) {
        try { await structureApi.removePosition(id); }
        catch (err) { console.error("[YÜKAY] Vəzifə silinmədi:", err); }
      }
    }
  }

  // --------------------------------------------------------------------------
  // setAnalyses — local state + DB sinxronizasiyası
  // analyses: { [position_id]: { tasks, jobDescription, status, updatedAt, updatedBy } }
  // --------------------------------------------------------------------------
  const setAnalyses = useCallback((updater) => {
    setAnalysesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncAnalyses(prev, next);
      return next;
    });
  }, []);

  async function syncAnalyses(prev, next) {
    for (const positionId of Object.keys(next)) {
      const old = prev[positionId];
      const cur = next[positionId];
      if (JSON.stringify(old) !== JSON.stringify(cur)) {
        try {
          await analysesApi.save(positionId, {
            tasks: cur.tasks, jobDescription: cur.jobDescription,
            status: cur.status, updatedByName: cur.updatedBy,
          });
        } catch (err) { console.error("[YÜKAY] Analiz yazılmadı:", err); }
      }
    }
  }

  // --------------------------------------------------------------------------
  // setCurrentUser — login/logout, real Supabase auth ilə
  // --------------------------------------------------------------------------
  const setCurrentUser = useCallback((user) => {
    if (user === null) {
      authApi.signOut().catch((e) => console.error("[YÜKAY] Çıxış xətası:", e));
      setCurrentUserState(null);
      setUsersState([]); setRolesState([]); setStructureState([]);
      setAnalysesState({}); setAuditLogState([]);
    } else {
      setCurrentUserState(user);
    }
  }, []);

  // --------------------------------------------------------------------------
  // RBAC helperləri
  // --------------------------------------------------------------------------
  const userRole = currentUser ? roles.find((r) => r.id === currentUser.role_id) : null;
  const can = (perm) => userRole?.permissions?.includes(perm) || false;

  const inScope = (deptNameOrPath) => {
    if (!currentUser) return false;
    if (currentUser.scope === "all") return true;
    if (!Array.isArray(currentUser.scope)) return false;
    if (Array.isArray(deptNameOrPath)) {
      return deptNameOrPath.some((n) => currentUser.scope.includes(n));
    }
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
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  if (!authChecked) {
    return (
      <ThemeCtx.Provider value={{ theme, dark, setDark }}>
        <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
          <div className="flex flex-col items-center gap-3">
            <AzerconnectLogo style={{ height: 36, width: "auto" }} />
            <div className="text-xs" style={{ color: theme.textMuted }}>Yüklənir...</div>
          </div>
        </div>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ theme, dark, setDark }}>
      <LangCtx.Provider value={{ lang, setLang, t }}>
        <AuthCtx.Provider value={authValue}>
          <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh" }}>
            {!currentUser ? (
              <Login />
            ) : loadingData && structure.length === 0 ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <AzerconnectLogo style={{ height: 32, width: "auto" }} />
                  <div className="text-xs" style={{ color: theme.textMuted }}>Məlumatlar yüklənir...</div>
                </div>
              </div>
            ) : loadError ? (
              <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm text-center">
                  <div className="text-sm font-medium mb-2" style={{ color: theme.danger }}>
                    Verilənlər yüklənmədi
                  </div>
                  <div className="text-xs mb-4" style={{ color: theme.textMuted }}>{loadError}</div>
                  <button onClick={loadAllData}
                          className="px-4 py-2 text-sm font-medium text-white"
                          style={{ background: theme.accent, borderRadius: 2 }}>
                    Yenidən cəhd et
                  </button>
                </div>
              </div>
            ) : (
              <AppShell />
            )}
          </div>
        </AuthCtx.Provider>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
