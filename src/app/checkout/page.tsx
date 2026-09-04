"use client";
/* eslint-disable react/no-unescaped-entities */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lock, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useStore } from "@/components/store";
import { formatPrice } from "@/lib/catalog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Customer = { email: string; firstName: string; lastName: string; phone: string; address: string; postalCode: string; city: string };
const initialCustomer: Customer = { email: "", firstName: "", lastName: "", phone: "", address: "", postalCode: "", city: "" };

export default function CheckoutPage() {
  const { cart, total, clearCart } = useStore();
  const [customer, setCustomer] = useState(initialCustomer);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [orderId, setOrderId] = useState("");
  const discount = promoApplied ? total * 0.3 : 0;
  const finalTotal = total - discount;
  const update = (field: keyof Customer, value: string) => setCustomer((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (isSupabaseConfigured()) { const { data } = await createClient().auth.getSession(); if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`; }
      const response = await fetch("/api/orders", { method: "POST", headers, body: JSON.stringify({ customer, promoCode: promoApplied ? promoCode : "", items: cart.map((item) => ({ id: item.id, quantity: item.quantity })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible de confirmer la commande.");
      setOrderId(result.orderId); setWarning(result.warning || ""); clearCart(); setConfirmed(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de confirmer la commande."); }
    finally { setLoading(false); }
  }

  if (confirmed) return <main><CheckoutHeader /><section className="checkout confirmation"><div className="confirmation-icon"><Check size={28} /></div><p className="eyebrow">Merci pour votre confiance</p><h1>Commande confirmée.</h1><p>Votre commande <strong>#{orderId.slice(0, 8)}</strong> est enregistrée. Notre équipe vous contactera rapidement.</p>{warning && <p className="checkout-warning">{warning}</p>}<Link className="button button-dark" href="/shop">Continuer mes achats <ArrowRight size={16} /></Link></section></main>;
  return <main><CheckoutHeader /><section className="checkout checkout-modern"><Link className="back-link" href="/shop"><ArrowLeft size={15} /> Retour à la boutique</Link>{!cart.length ? <div className="empty-shop"><h1>Votre panier est vide</h1><p>Ajoutez quelques favoris avant de passer commande.</p><Link className="button button-dark" href="/shop">Découvrir la boutique</Link></div> : <><div className="checkout-intro"><div><p className="eyebrow">Dernière étape</p><h1>Préparez votre<br /><em>pause parfaite.</em></h1></div><div className="checkout-steps"><span className="done"><Check size={13} /> Panier</span><span className="current">02 Livraison</span><span>03 Confirmation</span></div></div><div className="checkout-grid checkout-grid-modern"><form className="checkout-form" onSubmit={submit}><CheckoutBlock number="01" title="Vos coordonnées" description="Pour vous contacter au sujet de votre commande."><label className="checkout-label">Email<input type="email" value={customer.email} onChange={(event) => update("email", event.target.value)} placeholder="vous@exemple.com" required /></label><div className="form-row"><label className="checkout-label">Prénom<input value={customer.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Votre prénom" required /></label><label className="checkout-label">Nom<input value={customer.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Votre nom" required /></label></div><label className="checkout-label">Téléphone<input value={customer.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+216 XX XXX XXX" required /></label></CheckoutBlock><CheckoutBlock number="02" title="Adresse de livraison" description="Livraison standard partout en Tunisie."><label className="checkout-label">Adresse<input value={customer.address} onChange={(event) => update("address", event.target.value)} placeholder="Rue et numéro" required /></label><div className="form-row"><label className="checkout-label">Code postal<input value={customer.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="1000" required /></label><label className="checkout-label">Ville<input value={customer.city} onChange={(event) => update("city", event.target.value)} placeholder="Tunis" required /></label></div><div className="delivery-choice"><Truck size={20} /><span><strong>Livraison standard</strong><small>Partout en Tunisie · À calculer avec l'équipe</small></span><b>À venir</b></div></CheckoutBlock><CheckoutBlock number="03" title="Paiement" description="Simple et sécurisé."><div className="payment-choice"><Check size={17} /><span><strong>Paiement à la livraison</strong><small>Payez à la réception de votre commande</small></span></div></CheckoutBlock><CheckoutBlock number="04" title="Code promotionnel" description="Une attention spéciale pour votre prochaine pause."><div className="promo-field"><input value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setPromoApplied(false); }} placeholder="Entrez votre code" aria-label="Code promotionnel" /><button type="button" onClick={() => setPromoApplied(promoCode.trim().toUpperCase() === "ZIZA")}>{promoApplied ? "Appliqué" : "Appliquer"}</button></div>{promoCode && !promoApplied && <p className="promo-error">Code invalide ou non appliqué.</p>}{promoApplied && <p className="promo-success">Code ZIZA appliqué : -30%.</p>}</CheckoutBlock>{error && <p className="checkout-error">{error}</p>}<button className="button button-dark checkout-submit" type="submit" disabled={loading}>{loading ? "Traitement de la commande..." : "Confirmer ma commande"} <ArrowRight size={17} /></button></form><aside className="checkout-summary checkout-summary-modern"><div className="summary-heading"><div><p className="eyebrow">Votre sélection</p><h2>Récapitulatif</h2></div><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} article(s)</span></div><div className="summary-products">{cart.map((item) => <div className="checkout-product" key={item.id}><div className="checkout-product-image"><Image src={item.image} alt={item.name} width={78} height={78} /><b>{item.quantity}</b></div><div><strong>{item.name}</strong><span>{item.format}</span></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="summary-lines"><p>Sous-total <strong>{formatPrice(total)}</strong></p>{promoApplied && <p>Remise ZIZA <strong>-{formatPrice(discount)}</strong></p>}<p>Livraison <span>À confirmer</span></p><hr /><p className="total">Total <strong>{formatPrice(finalTotal)}</strong></p></div><div className="summary-trust"><p><ShieldCheck size={15} /> Paiement à la livraison</p><p><PackageCheck size={15} /> Emballage soigné</p><p><MapPin size={15} /> Livraison en Tunisie</p></div></aside></div></>}</section></main>;
}

function CheckoutHeader() { return <header className="checkout-header"><Link className="wordmark" href="/">NUTVORA<span>®</span></Link><span className="checkout-secure"><Lock size={14} /> Commande sécurisée</span></header>; }
function CheckoutBlock({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) { return <section className="checkout-block"><div className="block-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>{children}</section>; }
