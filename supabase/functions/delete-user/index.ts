// Supabase Edge Function: delete-user — bax create-user/index.ts izahatı

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { id } = await req.json();

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { data: profile } = await userClient
      .from("profiles").select("role_id").eq("id", user.id).single();
    const { data: role } = await userClient
      .from("roles").select("permissions").eq("id", profile?.role_id).single();
    if (!role?.permissions?.includes("admin.users")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await adminClient.auth.admin.deleteUser(id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
