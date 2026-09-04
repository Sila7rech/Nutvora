"use client";

import Link from "next/link";
import { ArrowRight, Check, Globe2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      if (!isSupabaseConfigured()) throw new Error("La connexion est presque prête. Ajoutez vos clés Supabase dans .env.local puis redémarrez le serveur.");
      const supabase = createClient();
      const result = isRegister
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (isRegister) setMessage("Votre compte est créé. Consultez votre email pour confirmer votre adresse.");
      else router.push("/");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Une erreur est survenue. Vérifiez vos informations."); }
    finally { setLoading(false); }
  }

  async function signInWithGoogle() {
    setError(""); setLoading(true);
    try {
      if (!isSupabaseConfigured()) throw new Error("Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local avant d'utiliser Google.");
      const supabase = createClient();
      const { error: googleError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (googleError) throw googleError;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "La connexion Google est indisponible.";
      setError(message.toLowerCase().includes("unsupported provider") ? "Google n'est pas encore activé dans Supabase Authentication. Activez le provider Google puis réessayez." : message);
      setLoading(false);
    }
  }

  return <main className="auth-page"><div className="auth-panel"><Link className="wordmark auth-logo" href="/">NUTVORA<span>®</span></Link><div className="auth-heading"><p className="eyebrow">Votre espace NUTVORA</p><h1>{isRegister ? "Créer votre compte" : "Bon retour parmi nous"}</h1><p>{isRegister ? "Enregistrez vos favoris et retrouvez vos commandes en un instant." : "Connectez-vous pour retrouver votre sélection et vos commandes."}</p></div><button className="google-button" onClick={signInWithGoogle} disabled={loading}><Globe2 size={16} /> Continuer avec Google</button><div className="auth-divider"><span>ou avec votre email</span></div><form className="auth-form" onSubmit={submit}>{isRegister && <label>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" required /></label><label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 caractères minimum" minLength={6} required /></label>{error && <p className="auth-error">{error}</p>}{message && <p className="auth-message"><Check size={15} /> {message}</p>}<button className="button button-dark full" type="submit" disabled={loading}>{loading ? "Chargement..." : isRegister ? "Créer mon compte" : "Se connecter"} <ArrowRight size={16} /></button></form><p className="auth-switch">{isRegister ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Se connecter" : "Créer un compte"}</Link></p><p className="auth-security"><LockKeyhole size={13} /> Vos données sont protégées.</p></div><div className="auth-visual"><div><p className="eyebrow">Snack better.</p><h2>Feel <em>better.</em></h2><p>Des ingrédients vrais, des pauses qui font du bien.</p></div></div></main>;
}
