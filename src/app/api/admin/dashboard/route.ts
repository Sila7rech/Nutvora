import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

const normalizedStatus = (status: string) => status === "pending" ? "NEW" : status === "confirmed" ? "CONFIRMED" : status === "shipped" ? "OUT_FOR_DELIVERY" : status.toUpperCase();
const startForRange = (range: string) => { const start = new Date(); if (range === "Today") start.setHours(0, 0, 0, 0); else if (range === "Yesterday") { start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0); } else if (range === "This month") { start.setDate(1); start.setHours(0, 0, 0, 0); } else { start.setDate(start.getDate() - (range === "Last 7 days" ? 7 : 30)); start.setHours(0, 0, 0, 0); } return start; };
function errorResponse(error: unknown) { const message = error instanceof Error ? error.message : "Unable to load dashboard."; const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500; return NextResponse.json({ error: status === 401 ? "Unauthorized" : status === 403 ? "Admin access required" : "Unable to load dashboard." }, { status }); }

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin();
    const range = new URL(request.url).searchParams.get("range") ?? "Last 30 days";
    const start = startForRange(range);
    const previousStart = new Date(start); previousStart.setDate(previousStart.getDate() - Math.max(1, Math.ceil((Date.now() - start.getTime()) / 86400000)));
    const [{ data: orders, error: ordersError }, { count: customerCount, error: customersError }, { data: products, error: productsError }] = await Promise.all([
      client.from("orders").select("id,email,status,total,shipping_address,created_at,order_items(product_name,quantity)").gte("created_at", previousStart.toISOString()).order("created_at", { ascending: false }),
      client.from("profiles").select("id", { count: "exact", head: true }),
      client.from("products").select("id,name,sku,stock,reserved_stock,low_stock_threshold").order("stock", { ascending: true }),
    ]);
    if (ordersError) throw ordersError; if (customersError) throw customersError; if (productsError && productsError.code !== "PGRST205") throw productsError;
    const rows = orders ?? [];
    const currentOrders = rows.filter((order) => new Date(order.created_at) >= start);
    const previousOrders = rows.filter((order) => new Date(order.created_at) < start);
    const sales = currentOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const previousSales = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const statusCounts = currentOrders.reduce<Record<string, number>>((counts, order) => { const status = normalizedStatus(order.status); counts[status] = (counts[status] ?? 0) + 1; return counts; }, {});
    const dailySales = Array.from({ length: 24 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + Math.floor(index * Math.max(1, (Date.now() - start.getTime()) / 86400000) / 24)); const next = new Date(day); next.setDate(day.getDate() + 1); return { label: day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), value: currentOrders.filter((order) => { const created = new Date(order.created_at); return created >= day && created < next; }).reduce((sum, order) => sum + Number(order.total), 0) }; });
    const lowStock = (products ?? []).filter((product) => product.stock <= product.low_stock_threshold).slice(0, 8);
    return NextResponse.json({ range, sales, previousSales, orderCount: currentOrders.length, pendingOrders: (statusCounts.NEW ?? 0) + (statusCounts.CONFIRMED ?? 0) + (statusCounts.PREPARING ?? 0) + (statusCounts.READY ?? 0) + (statusCounts.OUT_FOR_DELIVERY ?? 0), customerCount: customerCount ?? 0, lowStockCount: lowStock.length, statusCounts, dailySales, recentOrders: currentOrders.slice(0, 5), lowStock });
  } catch (error) { return errorResponse(error); }
}
