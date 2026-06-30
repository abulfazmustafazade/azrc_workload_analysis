import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://hlmawofzyljxfoklrjrh.supabase.co";
const supabaseAnonKey = "sb_publishable_tfIZOHhqkqNNRIPxMGrBUQ_eiVdXbo5";

if (!supabaseUrl || !supabaseAnonKey) {
  // Konsola aydın xəbərdarlıq — .env unudulduqda səssiz xəta əvəzinə
  console.error(
    "[YÜKAY] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tapılmadı. " +
    ".env faylını yoxlayın (bax: .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
