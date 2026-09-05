"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, LogOut, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Header } from "@/components/store";
import { OrderTracking } from "@/components/order-tracking";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Profile = { full_name: string; email: string; phone: string; address: string; avatar_url: string };
const emptyProfile: Profile = { full_name: "", email: "", phone: "", address: "", avatar_url: "" };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured()) { setError("Supabase n'est pas configuré."); setLoading(false); return; }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data, error: profileError } = await supabase.from("profiles").select("full_name, email, phone, address, avatar_url").eq("id", user.id).maybeSingle();
      if (profileError) setError(profileError.code === "PGRST205" ? "La table profiles n'est pas encore créée dans Supabase. Exécutez supabase/schema.sql dans le SQL Editor, puis rechargez cette page." : profileError.message);
      setProfile({ ...emptyProfile, email: user.email ?? "", full_name: user.user_metadata?.full_name ?? "", ...data });
      setLoading(false);
    }
    void loadProfile();
  }, [router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert({ id: userId, ...profile }, { onConflict: "id" });
    if (updateError) setError(updateError.message);
    else { await supabase.auth.updateUser({ data: { full_name: profile.full_name } }); setMessage("Votre profil a été enregistré."); }
    setSaving(false);
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !userId) return;
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) { setError("Choisissez une image de 3 Mo maximum."); return; }
    setError(""); setMessage("Téléversement de votre photo...");
    const supabase = createClient();
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setError(uploadError.message); setMessage(""); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: profileError } = await supabase.from("profiles").upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: "id" });
    if (profileError) setError(profileError.message); else { setProfile((current) => ({ ...current, avatar_url: avatarUrl })); setMessage("Photo de profil mise à jour."); }
  }

  async function logout() { const supabase = createClient(); await supabase.auth.signOut(); router.push("/"); }

  if (loading) return <main><Header /><section className="profile-page"><div className="profile-loading">Chargement de votre espace...</div></section></main>;
  return <main><Header /><section className="profile-page"><div className="profile-shell"><Link className="back-link" href="/"><ArrowLeft size={15} /> Retour à l&apos;accueil</Link><div className="profile-heading"><div><p className="eyebrow">Votre espace personnel</p><h1>Mon profil</h1><p>Gérez vos informations et personnalisez votre expérience NUTVORA.</p></div><button className="logout-button" onClick={logout}><LogOut size={15} /> Se déconnecter</button></div><div className="profile-grid"><aside className="profile-card"><div className="avatar-wrap">{profile.avatar_url ? <Image src={profile.avatar_url} alt="Photo de profil" fill sizes="140px" /> : <UserRound size={48} />}</div><label className="avatar-upload"><Camera size={15} /> Modifier la photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} /></label><strong>{profile.full_name || "Votre nom"}</strong><span>{profile.email}</span><small>Membre NUTVORA</small></aside><form className="profile-form" onSubmit={saveProfile}><div className="form-section"><h2>Informations personnelles</h2><div className="profile-field"><UserRound size={16} /><label>Nom complet<input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} placeholder="Votre nom" /></label></div><div className="profile-field"><Mail size={16} /><label>Email<input value={profile.email} readOnly aria-readonly="true" /></label></div><div className="profile-field"><Phone size={16} /><label>Téléphone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="+216 XX XXX XXX" /></label></div><div className="profile-field"><MapPin size={16} /><label>Adresse de livraison<textarea value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} placeholder="Votre adresse" rows={3} /></label></div></div>{error && <p className="auth-error">{error}</p>}{message && <p className="auth-message"><Check size={15} /> {message}</p>}<button className="button button-dark profile-save" type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer les modifications"} <Check size={16} /></button></form></div><OrderTracking /></div></section></main>;
}
