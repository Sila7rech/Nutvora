"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { formatPrice, Product } from "@/lib/catalog";
import { PreferencesMenu, usePreferences } from "@/lib/i18n";

type CartLine = Product & { quantity: number };
type StoreContextValue = { cart: CartLine[]; addToCart: (product: Product) => void; removeFromCart: (id: string) => void; clearCart: () => void; cartOpen: boolean; setCartOpen: (open: boolean) => void; total: number };
const StoreContext = createContext<StoreContextValue | null>(null);

let cartRaw: string | null = null;
let cartSnapshot: CartLine[] = [];
const cartListeners = new Set<() => void>();

function readCart() {
  if (typeof window === "undefined") return cartSnapshot;
  const raw = window.localStorage.getItem("nutvora-cart");
  if (raw === cartRaw) return cartSnapshot;
  cartRaw = raw;
  try { cartSnapshot = raw ? JSON.parse(raw) : []; } catch { cartSnapshot = []; }
  return cartSnapshot;
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { cartListeners.delete(listener); window.removeEventListener("storage", listener); };
}

function updateCart(nextCart: CartLine[]) {
  cartSnapshot = nextCart;
  cartRaw = JSON.stringify(nextCart);
  window.localStorage.setItem("nutvora-cart", cartRaw);
  cartListeners.forEach((listener) => listener());
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(subscribeToCart, readCart, () => []);
  const [cartOpen, setCartOpen] = useState(false);
  const addToCart = (product: Product) => { const found = cart.find((item) => item.id === product.id); updateCart(found ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { ...product, quantity: 1 }]); setCartOpen(true); };
  const removeFromCart = (id: string) => updateCart(cart.flatMap((item) => item.id === id ? item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [] : [item]));
  const clearCart = () => updateCart([]);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <StoreContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartOpen, setCartOpen, total }}>{children}<CartDrawer /></StoreContext.Provider>;
}

export function useStore() { const context = useContext(StoreContext); if (!context) throw new Error("useStore must be used inside StoreProvider"); return context; }

export function Header({ simple = false }: { simple?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, setCartOpen } = useStore();
  const { t, locale } = usePreferences();
  const href = (path: string) => `/${locale}${path === "/" ? "" : path}`;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <><div className="announcement"><span>{t("header.delivery")}</span><span>{t("header.natural")}</span><span>{t("header.preservatives")}</span><span>+216 XX XXX XXX</span></div><header className="site-header"><button className="mobile-menu" aria-label={t("header.openMenu")} onClick={() => setMenuOpen(true)}><Menu /></button><Link href={href("/")} className="wordmark">NUTVORA<span>®</span></Link><nav className={menuOpen ? "nav mobile-visible" : "nav"}><button className="close-menu" aria-label={t("header.closeMenu")} onClick={() => setMenuOpen(false)}><X /></button><Link href={href("/")} onClick={() => setMenuOpen(false)}>{t("nav.home")}</Link><Link href={href("/shop")} onClick={() => setMenuOpen(false)}>{t("nav.shop")}</Link><Link href={href("/shop?category=Mix")} onClick={() => setMenuOpen(false)}>{t("nav.mixes")}</Link><Link href={href("/shop?category=Fruits%20secs")} onClick={() => setMenuOpen(false)}>{t("nav.nuts")}</Link><Link href={href("/shop?category=Coffrets")} onClick={() => setMenuOpen(false)}>{t("nav.boxes")}</Link><Link href={href("/#about")} onClick={() => setMenuOpen(false)}>{t("nav.about")}</Link><PreferencesMenu /></nav>{!simple && <div className="header-actions"><Link href={href("/shop")} aria-label={t("header.search")}><Search /></Link><Link href={href("/profile")} aria-label={t("header.profile")}><UserRound /></Link><Link href={href("/shop")} aria-label={t("header.favorites")}><Heart /></Link><button className="bag-button" aria-label={t("header.cart")} onClick={() => setCartOpen(true)}><ShoppingBag /><b>{count}</b></button></div>}</header></>;
}

export function ProductCard({ product }: { product: Product }) { const { addToCart } = useStore(); const { locale, t } = usePreferences(); return <article className="product-card"><Link className="product-image" href={`/${locale}/product/${product.id}`}><button className="favorite" aria-label={`${t("cart.favorites")} ${product.name}`} onClick={(event) => event.preventDefault()}><Heart size={17} /></button>{product.badge && <span className="product-badge">{product.badge}</span>}<Image src={product.image} alt={product.name} width={420} height={420} /></Link><div className="product-info"><div><h3>{product.name} <small>{product.format}</small></h3><p>{product.detail}</p><span className="rating">★★★★★ <small>(24)</small></span></div><strong>{formatPrice(product.price)}</strong></div><button className="add-button" onClick={() => addToCart(product)}>{t("cart.add")} <ArrowRight size={16} /></button></article>; }

function CartDrawer() { const { cart, removeFromCart, cartOpen, setCartOpen, total } = useStore(); const { locale, t } = usePreferences(); if (!cartOpen) return null; const count = cart.reduce((sum, item) => sum + item.quantity, 0); return <div className="cart-overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="cart-title"><div><p className="eyebrow">{t("cart.selection")}</p><h2>{t("cart.title")} <span>({count})</span></h2></div><button aria-label={t("common.close")} onClick={() => setCartOpen(false)}><X /></button></div>{!cart.length ? <div className="empty-cart"><ShoppingBag size={28} /><p>{t("cart.empty")}</p><Link className="button button-dark" href={`/${locale}/shop`} onClick={() => setCartOpen(false)}>{t("cart.discover")}</Link></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><Image src={item.image} alt="" width={76} height={76} /><div><strong>{item.name} · {item.format}</strong><p>{item.detail}</p><span>{item.quantity} x {formatPrice(item.price)}</span></div><button aria-label={t("cart.remove")} onClick={() => removeFromCart(item.id)}><X size={15} /></button></div>)}</div><div className="cart-summary"><p>{t("cart.subtotal")} <strong>{formatPrice(total)}</strong></p><p>{t("cart.delivery")} <strong>{t("cart.calculated")}</strong></p><hr /><p className="total">{t("cart.total")} <strong>{formatPrice(total)}</strong></p><Link className="button button-dark full" href={`/${locale}/checkout`} onClick={() => setCartOpen(false)}>{t("cart.checkout")} <ArrowRight size={16} /></Link></div></>}</aside></div>; }
