"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Boxes, CheckCircle, ChevronDown, CircleDollarSign, ClipboardList, FolderTree, LayoutDashboard, ListChecks, LogOut, Menu, PackageSearch, Search, Settings, ShoppingBag, SlidersHorizontal, Store, Truck, Users, X, Zap } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminRole = "SUPER ADMIN" | "ADMIN" | "STAFF";
type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; roles: AdminRole[] };
const allRoles: AdminRole[] = ["SUPER ADMIN", "ADMIN", "STAFF"];
const managementRoles: AdminRole[] = ["SUPER ADMIN", "ADMIN"];
const superAdminOnly: AdminRole[] = ["SUPER ADMIN"];
const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: allRoles }, { label: "Orders", href: "/admin/orders", icon: ClipboardList, roles: allRoles }] },
  { label: "Catalog", items: [{ label: "Products", href: "/admin/products", icon: ShoppingBag, roles: managementRoles }, { label: "Categories", href: "/admin/categories", icon: FolderTree, roles: managementRoles }, { label: "Inventory", href: "/admin/inventory", icon: Boxes, roles: allRoles }, { label: "Gift boxes", href: "/admin/gift-boxes", icon: PackageSearch, roles: managementRoles }, { label: "Drinks", href: "/admin/drinks", icon: CircleDollarSign, roles: managementRoles }, { label: "Custom mixes", href: "/admin/custom-mixes", icon: SlidersHorizontal, roles: managementRoles }] },
  { label: "Growth", items: [{ label: "Customers", href: "/admin/customers", icon: Users, roles: managementRoles }, { label: "Discounts", href: "/admin/discounts", icon: Zap, roles: managementRoles }, { label: "Analytics", href: "/admin/analytics", icon: Store, roles: managementRoles }, { label: "Reviews", href: "/admin/reviews", icon: CheckCircle, roles: managementRoles }] },
  { label: "Operations", items: [{ label: "Delivery", href: "/admin/delivery", icon: Truck, roles: managementRoles }, { label: "Activity", href: "/admin/activity", icon: ListChecks, roles: superAdminOnly }] },
];

export function AdminShell({ children, userEmail, role }: { children: React.ReactNode; userEmail: string; role: "SUPER ADMIN" | "ADMIN" | "STAFF" }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [search, setSearch] = useState("");
  async function logout() { await createClient().auth.signOut(); router.replace("/admin/login"); }
  const visibleGroups = navGroups.map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) })).filter((group) => group.items.length);
  return <div className="admin-frame"><aside className={`admin-sidebar ${open ? "is-open" : ""}`}><div className="admin-brand"><Link href="/admin/dashboard" onClick={() => setOpen(false)}>NUTVORA<span>®</span></Link><button className="admin-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button></div><div className="admin-store"><span className="store-mark">N</span><span><b>NUTVORA Store</b><small>{role} workspace</small></span><ChevronDown size={14} /></div><nav>{visibleGroups.map((group) => <div className="admin-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(({ label, href, icon: Icon }) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}><Icon size={16} />{label}</Link>)}</div>)}<div className="admin-nav-group admin-nav-bottom"><p>Workspace</p>{role !== "STAFF" && <Link href="/admin/website" className={pathname === "/admin/website" ? "active" : ""}><Store size={16} />Website</Link>}{role !== "STAFF" && <Link href="/admin/settings" className={pathname === "/admin/settings" ? "active" : ""}><Settings size={16} />Settings</Link>}{role === "SUPER ADMIN" && <Link href="/admin/team" className={pathname === "/admin/team" ? "active" : ""}><Users size={16} />Team</Link>}</div></nav><div className="admin-user"><span className="avatar">{userEmail.slice(0, 1).toUpperCase()}</span><span><b>{role}</b><small>{userEmail}</small></span><button onClick={logout} title="Log out"><LogOut size={15} /></button></div></aside><button className={`admin-scrim ${open ? "visible" : ""}`} onClick={() => setOpen(false)} aria-label="Close sidebar" /><main className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, products, customers..." /><kbd>⌘ K</kbd></div><div className="admin-top-actions"><button className="admin-icon-button" title="Notifications"><Bell size={18} /><i>3</i></button><span className="admin-divider" /><span className="admin-role">{role}</span></div></header><div className="admin-content">{children}</div></main></div>;
}
