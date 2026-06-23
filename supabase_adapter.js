// ============================================================================
// YÜKAY · Supabase adapter
// ============================================================================
// Bu fayl in-memory state-i Supabase çağırışları ilə əvəz etmək üçün
// adapter layeri verir. Prototipdə React state işlədilir; istehsalda
// həmin funksiyaları çağıracaqsınız.
//
// QURMA:
//   npm install @supabase/supabase-js
//
//   .env:
//     VITE_SUPABASE_URL=https://xxx.supabase.co
//     VITE_SUPABASE_ANON_KEY=eyJ...
// ============================================================================

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// ============================================================================
// AUTH
// ============================================================================
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*, role:roles(*)")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  },

  onChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
  },
};

// ============================================================================
// USERS (admin)
// ============================================================================
export const usersApi = {
  async list() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, role:roles(id,name_az,name_en,is_system)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Qeyd: yeni istifadəçi auth.signUp ilə yaradılır, profile trigger-lə yazılır.
  // Sonra profile-i yeniləyirik (role + scope).
  async create({ email, password, full_name, role_id, scope }) {
    const { data: signUp, error: e1 } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name }
    });
    if (e1) throw e1;
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name, role_id, scope })
      .eq("id", signUp.user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from("profiles").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    // auth.admin.deleteUser cascade ilə profile-i də silir
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  },
};

// ============================================================================
// ROLES (admin)
// ============================================================================
export const rolesApi = {
  async list() {
    const { data, error } = await supabase.from("roles").select("*").order("is_system", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create({ name_az, name_en, permissions }) {
    const { data, error } = await supabase
      .from("roles")
      .insert({
        id: crypto.randomUUID(),    // custom rollar üçün uuid
        name_az, name_en,
        is_system: false,
        permissions,
      })
      .select().single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const { data, error } = await supabase.from("roles").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// STRUKTUR (departments / units / positions)
// ============================================================================
export const structureApi = {
  // Tək sorğu ilə bütün ağacı çəkir
  async getTree() {
    const { data, error } = await supabase
      .from("departments")
      .select(`
        id, name_az, name_en,
        units (
          id, name_az,
          positions ( id, name_az, current_stat, proposed, note )
        )
      `)
      .order("created_at");
    if (error) throw error;
    return data;
  },

  // departments
  async createDept(name_az, name_en) {
    const { data, error } = await supabase
      .from("departments").insert({ name_az, name_en }).select().single();
    if (error) throw error;
    return data;
  },
  async updateDept(id, fields) {
    const { data, error } = await supabase.from("departments").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async removeDept(id) {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw error;
  },

  // units
  async createUnit(dept_id, name_az) {
    const { data, error } = await supabase.from("units").insert({ dept_id, name_az }).select().single();
    if (error) throw error;
    return data;
  },
  async updateUnit(id, fields) {
    const { data, error } = await supabase.from("units").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async removeUnit(id) {
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (error) throw error;
  },

  // positions
  async createPosition(unit_id, { name_az, current_stat, proposed = 0, note = null }) {
    const { data, error } = await supabase
      .from("positions")
      .insert({ unit_id, name_az, current_stat, proposed, note })
      .select().single();
    if (error) throw error;
    return data;
  },
  async updatePosition(id, fields) {
    const { data, error } = await supabase.from("positions").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async removePosition(id) {
    const { error } = await supabase.from("positions").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// ANALYSES (xronometraj)
// ============================================================================
export const analysesApi = {
  async getByPosition(position_id) {
    const { data, error } = await supabase
      .from("analyses")
      .select(`*, tasks:analysis_tasks(*), jd_duties(*)`)
      .eq("position_id", position_id)
      .maybeSingle();
    if (error) throw error;
    if (data?.tasks) data.tasks.sort((a, b) => a.ordinal - b.ordinal);
    if (data?.jd_duties) data.jd_duties.sort((a, b) => a.ordinal - b.ordinal);
    return data;
  },

  async listInScope() {
    // RLS avtomatik filtr edir (yalnız scope-da olan vəzifələrin analizləri)
    const { data, error } = await supabase
      .from("analyses")
      .select(`*, tasks:analysis_tasks(*), jd_duties(*), position:positions(id,name_az,current_stat,unit_id)`)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Bütün analizi (header + jd_duties + tasks) atomik şəkildə yadda saxlayır
  async upsert({ position_id, status, notes, jd_summary, jd_duties, norm_say_avg, norm_say_max, tasks }) {
    // 1. analyses header upsert
    const { data: analysis, error: e1 } = await supabase
      .from("analyses")
      .upsert({ position_id, status, notes, jd_summary, norm_say_avg, norm_say_max,
                updated_by: (await supabase.auth.getUser()).data.user.id },
              { onConflict: "position_id" })
      .select().single();
    if (e1) throw e1;

    // 2. jd_duties: köhnələri sil, yenilərini əlavə et
    await supabase.from("jd_duties").delete().eq("analysis_id", analysis.id);
    let jdMap = {};  // köhnə id → yeni id, taskları bağlamaq üçün
    if (jd_duties?.length) {
      const rows = jd_duties.map((d, i) => ({
        analysis_id: analysis.id,
        ordinal: i,
        duty_az: d.text,
      }));
      const { data: inserted, error: e2 } = await supabase.from("jd_duties").insert(rows).select();
      if (e2) throw e2;
      // index-based mapping (sıraya görə) — frontend tərəfdə id-lər müvəqqətidir
      jd_duties.forEach((d, i) => { jdMap[d.id] = inserted[i].id; });
    }

    // 3. analysis_tasks: köhnələri sil, yenilərini əlavə et
    await supabase.from("analysis_tasks").delete().eq("analysis_id", analysis.id);
    if (tasks?.length) {
      const rows = tasks.map((t, i) => ({
        analysis_id: analysis.id,
        ordinal: i,
        task_az: t.task,
        period: t.period,
        duration_min: t.dmin,
        duration_max: t.dmax,
        freq_min: t.fmin,
        freq_max: t.fmax,
        jd_duty_id: t.jdDutyId ? (jdMap[t.jdDutyId] || null) : null,
      }));
      const { error: e3 } = await supabase.from("analysis_tasks").insert(rows);
      if (e3) throw e3;
    }

    return analysis;
  },

  async approve(id) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("analyses")
      .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) throw error;
  },

  // Real-time: analiz dəyişikliklərini izlə
  subscribeToChanges(callback) {
    return supabase
      .channel("analyses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "analyses" }, callback)
      .on("postgres_changes", { event: "*", schema: "public", table: "analysis_tasks" }, callback)
      .subscribe();
  },
};

// ============================================================================
// AUDIT LOG
// ============================================================================
export const auditApi = {
  async list({ limit = 100, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  // Manuel audit qeydi (məs. login/logout)
  async log(action, target_label, payload = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_name: profile?.full_name || user.email,
      action,
      target_label,
      payload,
    });
  },
};

// ============================================================================
// PERMISSION HELPERS (frontend tərəfi)
// ============================================================================
// Backend RLS hər sorğunu yoxlayır; bu helperlər UI-də erkən gizlətmə üçündür.
export function can(profile, permission) {
  return profile?.role?.permissions?.includes(permission) || false;
}

export function inScope(profile, deptName) {
  if (!profile?.scope) return false;
  if (profile.scope.includes("*")) return true;
  return profile.scope.includes(deptName);
}

// ============================================================================
// CALC HELPERS (Excel ilə eyni metodologiya)
// ============================================================================
const WORK_DAY_MIN = 420;
const WORK_WEEK_DAYS = 5;
const WORK_MONTH_DAYS = 22;

export function taskDailyMin(t, useMax) {
  const dur = useMax ? t.duration_max : t.duration_min;
  const freq = useMax ? t.freq_max : t.freq_min;
  if (!dur || !freq) return 0;
  const total = dur * freq;
  if (t.period === "daily") return total;
  if (t.period === "weekly") return total / WORK_WEEK_DAYS;
  if (t.period === "monthly") return total / WORK_MONTH_DAYS;
  return total;
}

export function calcNormSay(tasks) {
  const avgDaily = tasks.reduce((s, t) => s + taskDailyMin(t, false), 0);
  const maxDaily = tasks.reduce((s, t) => s + taskDailyMin(t, true), 0);
  return {
    avgDaily, maxDaily,
    avgNormSay: avgDaily / WORK_DAY_MIN,
    maxNormSay: maxDaily / WORK_DAY_MIN,
  };
}

// ============================================================================
// İSTİFADƏ NÜMUNƏSİ (App.jsx-də)
// ============================================================================
/*
  import { auth, structureApi, analysesApi, auditApi } from "./supabase_adapter";

  // Login
  await auth.signIn(email, password);
  const profile = await auth.getCurrentProfile();

  // Strukturu yüklə (RLS avtomatik scope-a görə filtr edir)
  const tree = await structureApi.getTree();

  // Bir vəzifənin analizini yüklə
  const analysis = await analysesApi.getByPosition(positionId);

  // Yadda saxla
  const norms = calcNormSay(analysis.tasks);
  await analysesApi.upsert({
    position_id: positionId,
    status: "completed",
    notes: "...",
    norm_say_avg: norms.avgNormSay,
    norm_say_max: norms.maxNormSay,
    tasks: localTasks,
  });

  // Real-time: başqa istifadəçi analizi yenilədikdə
  const sub = analysesApi.subscribeToChanges((payload) => {
    console.log("change:", payload);
    refreshAnalyses();
  });
  // sub.unsubscribe() — komponent unmount olduqda
*/
