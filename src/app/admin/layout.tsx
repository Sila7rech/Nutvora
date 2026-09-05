import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let userEmail: string | undefined;
  try {
    const { context } = await requireAdmin();
    userEmail = context.email;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") redirect("/admin/login");
    if (message === "FORBIDDEN") redirect("/admin/login?error=not-admin");
    redirect("/admin/login?error=configuration");
  }
  return <AdminShell userEmail={userEmail ?? "admin"}>{children}</AdminShell>;
}
