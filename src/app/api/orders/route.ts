import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { getProduct, formatPrice } from "@/lib/catalog";

type OrderRequest = {
  customer: { email: string; firstName: string; lastName: string; phone: string; address: string; postalCode: string; city: string };
  items: { id: string; quantity: number }[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as OrderRequest;
    const { customer, items } = body;
    if (!customer?.email || !customer.firstName || !customer.lastName || !customer.phone || !customer.address || !customer.city || !items?.length) return NextResponse.json({ error: "Informations de commande incomplètes." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });

    const lines = items.map((item) => ({ product: getProduct(item.id), quantity: Math.max(1, Math.floor(Number(item.quantity))) })).filter((item) => item.product);
    if (!lines.length || lines.length !== items.length) return NextResponse.json({ error: "Un produit de la commande est invalide." }, { status: 400 });
    const total = lines.reduce((sum, line) => sum + line.product!.price * line.quantity, 0);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "").trim();
    const { data: { user } } = accessToken ? await supabase.auth.getUser(accessToken) : { data: { user: null } };
    const shippingAddress = { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, address: customer.address, postalCode: customer.postalCode, city: customer.city, country: "Tunisie" };
    const { data: order, error: orderError } = await supabase.from("orders").insert({ user_id: user?.id ?? null, email: customer.email, total, shipping_address: shippingAddress }).select("id").single();
    if (orderError || !order) throw new Error(orderError?.message || "Impossible d'enregistrer la commande.");
    const { error: itemsError } = await supabase.from("order_items").insert(lines.map((line) => ({ order_id: order.id, product_id: line.product!.id, product_name: `${line.product!.name} · ${line.product!.format}`, quantity: line.quantity, unit_price: line.product!.price })));
    if (itemsError) throw new Error(itemsError.message);

    const orderRows = lines.map((line) => `<tr><td style="padding:8px 0">${line.product!.name} · ${line.product!.format}</td><td style="padding:8px 0;text-align:center">${line.quantity}</td><td style="padding:8px 0;text-align:right">${formatPrice(line.product!.price * line.quantity)}</td></tr>`).join("");
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPassword) return NextResponse.json({ orderId: order.id, warning: "Commande enregistrée. Configurez GMAIL_USER et GMAIL_APP_PASSWORD pour recevoir l'email." });
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPassword } });
    try {
      await transporter.sendMail({ from: `NUTVORA <${gmailUser}>`, to: "saberbradaiset23@gmail.com", replyTo: customer.email, subject: `Nouvelle commande NUTVORA · ${order.id.slice(0, 8)}`, html: `<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#171714"><h1>Nouvelle commande NUTVORA</h1><p><strong>Commande :</strong> ${order.id}</p><h2>Client</h2><p>${customer.firstName} ${customer.lastName}<br>${customer.email}<br>${customer.phone}<br>${customer.address}, ${customer.postalCode} ${customer.city}, Tunisie</p><h2>Articles</h2><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Produit</th><th>Quantité</th><th style="text-align:right">Prix</th></tr></thead><tbody>${orderRows}</tbody></table><p style="font-size:18px;text-align:right"><strong>Total : ${formatPrice(total)}</strong></p></div>` });
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : "SMTP Gmail indisponible.";
      return NextResponse.json({ orderId: order.id, warning: `Commande enregistrée, mais l'email n'a pas pu être envoyé : ${message}` }, { status: 202 });
    }
    return NextResponse.json({ orderId: order.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de traiter la commande." }, { status: 500 }); }
}
