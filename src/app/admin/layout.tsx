import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  if (requestHeaders.get("x-admin-pathname") === "/admin/login") return <>{children}</>;
  let adminEmail: string | undefined;
  try {
    const { context } = await requireAdmin();
    adminEmail = context.email;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FORBIDDEN") redirect("/admin/login?error=not-admin");
    redirect("/admin/login");
  }
  return <AdminShell userEmail={adminEmail ?? "admin"}>{children}</AdminShell>;
}
