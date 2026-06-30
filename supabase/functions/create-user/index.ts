

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { email, password, full_name, role_id, scope } = await req.json();

    // Çağıran istifadəçinin admin.users icazəsi olduğunu yoxlayırıq
    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { data: profile } = await userClient
      .from("profiles").select("role_id").eq("id", user.id).single();
    const { data: role } = await userClient
      .from("roles").select("permissions").eq("id", profile?.role_id).single();
    if (!role?.permissions?.includes("admin.users")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // Admin client — service_role ilə (yalnız bu funksiya daxilində)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name },
    });
    if (createError) throw createError;

    // Trigger profili yaradacaq (role_id='viewer' default ilə) — onu yeniləyirik
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ full_name, role_id, scope })
      .eq("id", newUser.user.id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ id: newUser.user.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
