import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let adminEmail: string | undefined;
  let contextRole: "SUPER ADMIN" | "ADMIN" | "STAFF" = "STAFF";
  try {
    const { context } = await requireAdmin();
    adminEmail = context.email;
    contextRole = context.role;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FORBIDDEN") redirect("/admin/login?error=not-admin");
    redirect("/admin/login");
  }
  return <AdminShell userEmail={adminEmail ?? "admin"} role={contextRole}>{children}</AdminShell>;
}
