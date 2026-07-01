import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hlmawofzyljxfoklrjrh.supabase.co";
const supabaseAnonKey = "sb_publishable_tfIZOHhqkqNNRIPxMGrBUQ_eiVdXbo5";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[YÜKAY] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tapılmadı. " +
    ".env faylını yoxlayın (bax: .env.example)."
  );
}

// db: "workload" — Supabase-də custom schema adı istifadə olunur.
// PostgREST hər sorğuya avtomatik bu schema-nı tətbiq edəcək.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  db: { schema: "workload" },
});
