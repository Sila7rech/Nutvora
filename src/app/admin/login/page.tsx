"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (!isSupabaseConfigured()) throw new Error("Configurez Supabase avant de vous connecter à l’administration.");
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace("/admin/dashboard");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Connexion impossible."); }
    finally { setLoading(false); }
  }

  return <main className="admin-login"><div className="admin-login-panel"><Link className="admin-wordmark" href="/">NUTVORA<span>®</span></Link><p className="admin-kicker">Administration</p><h1>Keep the good<br /><em>things moving.</em></h1><p className="admin-login-copy">Pilotez vos commandes, vos produits et votre activité depuis un espace unique.</p><form onSubmit={submit} className="admin-login-form"><label>Email professionnel<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@nutvora.tn" required /></label><label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" required /></label><label className="admin-remember"><input type="checkbox" /> <span>Se souvenir de moi</span><button type="button">Mot de passe oublié ?</button></label>{error && <p className="admin-form-error">{error}</p>}<button className="admin-submit" disabled={loading}>{loading ? "Connexion..." : "Ouvrir l’administration"}<ArrowRight size={17} /></button></form><p className="admin-security"><LockKeyhole size={14} /> Accès sécurisé · réservé à l’équipe NUTVORA</p></div><div className="admin-login-visual"><span>EST. 2024</span><strong>NUTVORA<br /><i>back office</i></strong><small>SNACK BETTER. FEEL BETTER.</small></div></main>;
}
