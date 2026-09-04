"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Header, useStore } from "@/components/store";
import { formatPrice, getProduct, products } from "@/lib/catalog";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id) ?? products[0];
  const { addToCart } = useStore();
  const [tab, setTab] = useState("Description");
  return <main><Header /><section className="product-detail"><Link className="back-link" href="/shop"><ArrowLeft size={15} /> Retour à la boutique</Link><div className="detail-grid"><div className="detail-image"><Image src={product.image} alt={product.name} width={650} height={650} priority /></div><div className="detail-copy"><p className="eyebrow">Premium mix · NUTVORA</p><h1>{product.name}</h1><p className="detail-format">Format {product.format}</p><span className="rating">★★★★★ <small>(24 avis)</small></span><p className="detail-description">{product.description}</p><div className="detail-price">{formatPrice(product.price)}</div><div className="weight-selector"><span>Format</span>{["50G", "100G", "200G"].map((format) => <button className={product.format === format ? "selected" : ""} key={format}>{format}</button>)}</div><div className="detail-actions"><button className="button button-dark" onClick={() => addToCart(product)}>Ajouter au panier <Plus size={16} /></button><button className="round-button" aria-label="Ajouter aux favoris"><Heart size={18} /></button></div><div className="detail-tabs">{["Description", "Composition", "Valeurs nutritionnelles", "Conservation"].map((item) => <button className={tab === item ? "selected" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><p className="tab-copy">{tab === "Description" ? product.description : tab === "Composition" ? "Amandes, cajous, noix et fruits naturellement séchés. Sans conservateurs ajoutés." : tab === "Valeurs nutritionnelles" ? "Une source naturelle d'énergie, de fibres et de bons lipides." : "À conserver dans un endroit frais et sec, à l'abri de la lumière."}</p></div></div></section></main>;
}
