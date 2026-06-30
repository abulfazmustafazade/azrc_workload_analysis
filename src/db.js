import { supabase } from "./supabase";

// ============================================================================
// YÜKAY · Supabase data layer
// ============================================================================
// Bu fayl tətbiqin bütün verilənlər bazası əməliyyatlarını cəmləyir.
// App.jsx başlanğıcda bu funksiyalarla bütün state-i DB-dən yükləyir,
// hər mutasiya (yarat/dəyiş/sil) birbaşa DB-yə yazılır və sonra local
// state DB-dən təzədən oxunaraq (və ya optimistic update ilə) yenilənir.
//
// Cədvəl strukturu supabase_schema.sql ilə üst-üstə düşür:
//   profiles, roles, departments(tree), units, positions, analyses,
//   analysis_tasks, jd_duties, audit_log
//
// QEYD: supabase_schema.sql-dəki "departments/units" 2 səviyyəli idi,
// 6 səviyyəli ağac üçün "nodes" cədvəlinə keçdik (bax: migration bölməsi
// supabase_schema.sql-in sonunda). Əgər köhnə sxemi saxlamısınızsa,
// schema faylını yeniləyin.
// ============================================================================

// ----------------------------------------------------------------------------
// AUTH
// ----------------------------------------------------------------------------
export const authApi = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Cari sessiyanın profilini (rol + scope ilə birlikdə) gətirir
  async getCurrentProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
  },
};

// ----------------------------------------------------------------------------
// ROLLAR
// ----------------------------------------------------------------------------
export const rolesApi = {
  async list() {
    const { data, error } = await supabase.from("roles").select("*").order("created_at");
    if (error) throw error;
    // DB-də permissions text[] kimi saxlanılır, frontend "system" boolean adlandırır
    return data.map((r) => ({
      id: r.id, name_az: r.name_az, name_en: r.name_en,
      system: r.is_system, permissions: r.permissions || [],
    }));
  },

  async create({ name_az, name_en, permissions }) {
    const id = "role_" + crypto.randomUUID().slice(0, 8);
    const { data, error } = await supabase
      .from("roles")
      .insert({ id, name_az, name_en, is_system: false, permissions })
      .select().single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const payload = { ...fields };
    if ("system" in payload) delete payload.system; // system statusu UI-dan dəyişdirilmir
    const { data, error } = await supabase.from("roles").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) throw error;
  },
};

// ----------------------------------------------------------------------------
// İSTİFADƏÇİLƏR (profiles)
// ----------------------------------------------------------------------------
export const usersApi = {
  async list() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((p) => ({
      id: p.id, full_name: p.full_name, email: p.email,
      role_id: p.role_id, scope: p.scope?.includes("*") ? "all" : (p.scope || []),
      status: p.status, created_at: p.created_at?.slice(0, 10),
    }));
  },

  // Yeni istifadəçi: əvvəlcə Supabase Auth-da hesab yaradılır (admin API),
  // sonra trigger profili avtomatik yaradır, biz onu rol/scope ilə update edirik.
  // QEYD: auth.admin.createUser yalnız service_role key ilə işləyir — bu, frontend-də
  // TƏHLÜKƏSİZ DEYİL. Production-da bunu bir Supabase Edge Function-a köçürün
  // (server-side, service_role açarı ilə) və buradan onu fetch ilə çağırın.
  async create({ email, password, full_name, role_id, scope }) {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: { email, password, full_name, role_id, scope: scope === "all" ? ["*"] : scope },
    });
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const payload = { ...fields };
    if (payload.scope) payload.scope = payload.scope === "all" ? ["*"] : payload.scope;
    const { data, error } = await supabase.from("profiles").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    // Edge Function vasitəsilə (auth.users sil → cascade profile-ı da silir)
    const { error } = await supabase.functions.invoke("delete-user", { body: { id } });
    if (error) throw error;
  },
};

// ----------------------------------------------------------------------------
// STRUKTUR (nodes — rekursiv ağac, parent_id ilə)
// ----------------------------------------------------------------------------
// DB-də "nodes" cədvəli: id, parent_id, level, name_az, name_en, created_at
// "positions" cədvəli: id, node_id, name_az, name_en, stat, ehtiyac, teklif, qeyd, salary
export const structureApi = {
  // Bütün node + position sətirlərini bir dəfəyə çəkib JS tərəfində ağaca yığır
  async getTree() {
    const [{ data: nodes, error: e1 }, { data: positions, error: e2 }] = await Promise.all([
      supabase.from("nodes").select("*").order("created_at"),
      supabase.from("positions").select("*").order("created_at"),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    const byId = new Map(nodes.map((n) => [n.id, { ...n, children: [], positions: [] }]));
    positions.forEach((p) => {
      const node = byId.get(p.node_id);
      if (node) node.positions.push(p);
    });

    const roots = [];
    nodes.forEach((n) => {
      const node = byId.get(n.id);
      if (n.parent_id && byId.has(n.parent_id)) {
        byId.get(n.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  },

  async createNode({ parent_id, level, name_az, name_en }) {
    const { data, error } = await supabase
      .from("nodes")
      .insert({ parent_id, level, name_az, name_en })
      .select().single();
    if (error) throw error;
    return data;
  },

  async updateNode(id, fields) {
    const { data, error } = await supabase.from("nodes").update(fields).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async removeNode(id) {
    // FK cascade: nodes.parent_id ON DELETE CASCADE, positions.node_id ON DELETE CASCADE
    const { error } = await supabase.from("nodes").delete().eq("id", id);
    if (error) throw error;
  },

  async createPosition(node_id, { name_az, name_en, stat, salary }) {
    const { data, error } = await supabase
      .from("positions")
      .insert({ node_id, name_az, name_en, stat, ehtiyac: stat, teklif: 0, salary })
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

// ----------------------------------------------------------------------------
// ANALİZLƏR (xronometraj + vəzifə təlimatı)
// ----------------------------------------------------------------------------
export const analysesApi = {
  // Bütün analizləri (RLS scope-a görə avtomatik filtrlənir) tasks + jd_duties ilə birlikdə
  async listAll() {
    const { data, error } = await supabase
      .from("analyses")
      .select(`*, tasks:analysis_tasks(*), jd_duties(*)`);
    if (error) throw error;

    const map = {};
    data.forEach((a) => {
      map[a.position_id] = {
        tasks: (a.tasks || [])
          .sort((x, y) => x.ordinal - y.ordinal)
          .map((t) => ({
            task: t.task_az, period: t.period,
            dmin: t.duration_min, dmax: t.duration_max,
            fmin: t.freq_min, fmax: t.freq_max,
            jdDutyId: t.jd_duty_id || undefined,
          })),
        jobDescription: {
          summary: a.jd_summary || "",
          duties: (a.jd_duties || [])
            .sort((x, y) => x.ordinal - y.ordinal)
            .map((d) => ({ id: d.id, text: d.duty_az })),
        },
        status: a.status,
        updatedAt: a.updated_at?.slice(0, 10),
        updatedBy: a.updated_by_name || "",
        _analysisId: a.id,
      };
    });
    return map;
  },

  // Bir analizi (header + tasks + jd_duties) atomik şəkildə yazır.
  // position_id üzərində unique constraint var → upsert ilə yaradır/yeniləyir.
  async save(position_id, { tasks, jobDescription, status, updatedByName }) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: analysis, error: e1 } = await supabase
      .from("analyses")
      .upsert({
        position_id,
        status,
        jd_summary: jobDescription?.summary || null,
        updated_by: user?.id,
        updated_by_name: updatedByName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "position_id" })
      .select().single();
    if (e1) throw e1;

    // jd_duties: köhnələri sil, yenilərini yaz (sıra qorunur)
    await supabase.from("jd_duties").delete().eq("analysis_id", analysis.id);
    let jdIdMap = {};
    if (jobDescription?.duties?.length) {
      const rows = jobDescription.duties.map((d, i) => ({
        analysis_id: analysis.id, ordinal: i, duty_az: d.text,
      }));
      const { data: inserted, error: e2 } = await supabase.from("jd_duties").insert(rows).select();
      if (e2) throw e2;
      jobDescription.duties.forEach((d, i) => { jdIdMap[d.id] = inserted[i].id; });
    }

    // analysis_tasks: köhnələri sil, yenilərini yaz
    await supabase.from("analysis_tasks").delete().eq("analysis_id", analysis.id);
    if (tasks?.length) {
      const rows = tasks.map((t, i) => ({
        analysis_id: analysis.id, ordinal: i,
        task_az: t.task, period: t.period,
        duration_min: t.dmin, duration_max: t.dmax,
        freq_min: t.fmin, freq_max: t.fmax,
        jd_duty_id: t.jdDutyId ? (jdIdMap[t.jdDutyId] || null) : null,
      }));
      const { error: e3 } = await supabase.from("analysis_tasks").insert(rows);
      if (e3) throw e3;
    }

    return analysis;
  },
};

// ----------------------------------------------------------------------------
// AUDIT LOG
// ----------------------------------------------------------------------------
export const auditApi = {
  async list(limit = 200) {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.map((e) => ({
      id: e.id,
      at: e.created_at?.slice(0, 16).replace("T", " "),
      actor: e.actor_name,
      action: e.action?.startsWith("audit_") ? e.action : `audit_${e.action}`,
      target: e.target_label,
    }));
  },

  // Manuel qeyd (login/logout kimi DB trigger-i olmayan hadisələr üçün)
  async log(action, target_label) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let actorName = user.email;
    try {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile?.full_name) actorName = profile.full_name;
    } catch { /* profil tapılmasa email istifadə olunur */ }

    await supabase.from("audit_log").insert({
      actor_id: user.id, actor_name: actorName, action, target_label,
    });
  },
};
