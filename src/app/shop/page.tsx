"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header, ProductCard } from "@/components/store";
import { products } from "@/lib/catalog";

const categories = ["Tout voir", "Mix", "Fruits secs", "Fruits séchés", "Coffrets"];

function ShopContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("category") || "Tout voir";
  const [category, setCategory] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Nouveautés");
  const visible = products.filter((product) => (category === "Tout voir" || product.category === category) && `${product.name} ${product.detail}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "Prix croissant" ? a.price - b.price : sort === "Prix décroissant" ? b.price - a.price : 0);
  return <main><Header /><section className="section shop-page"><p className="eyebrow">La sélection NUTVORA</p><h1 className="shop-title">La boutique</h1><p className="shop-intro">Des compositions généreuses, pensées pour les petites faims et les grands moments.</p><div className="shop-tools"><div className="filter-row">{categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}<select className="sort" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier les produits"><option>Nouveautés</option><option>Prix croissant</option><option>Prix décroissant</option></select></div><div className="shop-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit" aria-label="Rechercher un produit" /><span>{visible.length} article{visible.length > 1 ? "s" : ""}</span></div></div>{visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-shop"><h2>Aucun résultat</h2><p>Essayez un autre mot ou explorez toute la sélection.</p><button className="button button-dark" onClick={() => { setCategory("Tout voir"); setQuery(""); }}>Réinitialiser <ArrowRight size={15} /></button></div>}</section><section className="trust"><div><span>01</span><strong>Des ingrédients vrais</strong><p>Choisis avec exigence.</p></div><div><span>02</span><strong>Des formats pour chaque moment</strong><p>Nomade, quotidien ou à partager.</p></div><div><span>03</span><strong>Une livraison soignée</strong><p>Partout en Tunisie.</p></div><div><span>04</span><strong>Besoin d&apos;aide ?</strong><p><Link href="/#top">Contactez-nous</Link></p></div></section></main>;
}

export default function ShopPage() {
  return <Suspense fallback={<main><Header /><section className="section shop-page"><p className="eyebrow">La sélection NUTVORA</p><h1 className="shop-title">La boutique</h1></section></main>}><ShopContent /></Suspense>;
}
