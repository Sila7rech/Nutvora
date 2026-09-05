import { AdminTeamView } from "@/components/admin-team-live";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function TeamPage() { const { context } = await requireAdmin(); return <AdminTeamView currentRole={context.role} />; }