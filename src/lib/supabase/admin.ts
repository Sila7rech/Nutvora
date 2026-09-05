import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";

export type AdminContext = { userId: string; email: string; role: "SUPER ADMIN" | "ADMIN" | "STAFF" };

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("The Supabase service role key is not configured.");
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function requireAdmin(): Promise<{ client: SupabaseClient; context: AdminContext }> {
  const userClient = await createUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const client = getServiceClient();
  const { data: admin, error } = await client.from("admin_users").select("role:admin_roles(name)").eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  const roleRecord = (Array.isArray(admin?.role) ? admin.role[0] : admin?.role) as unknown as { name?: string } | undefined;
  const roleValue = roleRecord?.name;
  if (roleValue !== "SUPER ADMIN" && roleValue !== "ADMIN" && roleValue !== "STAFF") throw new Error("FORBIDDEN");
  return { client, context: { userId: user.id, email: user.email ?? "admin", role: roleValue } };
}
