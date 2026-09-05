export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type AdminRole = "SUPER ADMIN" | "ADMIN" | "STAFF";

export type AdminOrder = {
  id: string;
  customer: string;
  phone: string;
  date: string;
  products: string;
  total: number;
  payment: "COD · Pending" | "COD · Paid";
  status: OrderStatus;
};

export type InventoryItem = {
  id: string;
  product: string;
  sku: string;
  stock: number;
  reserved: number;
  threshold: number;
  category: string;
};

export const adminOrders: AdminOrder[] = [
  { id: "NV-1058", customer: "Ahmed Ben Ali", phone: "+216 22 481 900", date: "Today, 11:42", products: "Family Premium 200G + 1", total: 48.9, payment: "COD · Pending", status: "NEW" },
  { id: "NV-1057", customer: "Sarra Mansour", phone: "+216 98 231 744", date: "Today, 10:18", products: "Energy Mix 100G + 2", total: 43.8, payment: "COD · Paid", status: "PREPARING" },
  { id: "NV-1056", customer: "Yassine Trabelsi", phone: "+216 55 902 117", date: "Yesterday, 18:09", products: "Discovery Box", total: 54.9, payment: "COD · Paid", status: "OUT_FOR_DELIVERY" },
  { id: "NV-1055", customer: "Meriem Gharbi", phone: "+216 27 310 662", date: "Yesterday, 16:34", products: "Energy Mix 50G + 3", total: 38.7, payment: "COD · Paid", status: "DELIVERED" },
  { id: "NV-1054", customer: "Omar Kallel", phone: "+216 20 664 821", date: "06 Sep 2026", products: "Family Premium 200G", total: 36.9, payment: "COD · Pending", status: "CONFIRMED" },
];

export const inventoryItems: InventoryItem[] = [
  { id: "family-200", product: "Family Premium 200G", sku: "NVT-FAM-200", stock: 42, reserved: 8, threshold: 15, category: "Mixes" },
  { id: "energy-100", product: "Energy Mix 100G", sku: "NVT-ENE-100", stock: 5, reserved: 2, threshold: 10, category: "Mixes" },
  { id: "energy-50", product: "Energy Mix 50G", sku: "NVT-ENE-050", stock: 126, reserved: 14, threshold: 20, category: "Mixes" },
  { id: "discovery", product: "Discovery Box", sku: "NVT-DIS-BOX", stock: 0, reserved: 0, threshold: 8, category: "Gift Boxes" },
];

export const formatTnd = (value: number) => `${value.toFixed(2)} TND`;
export const statusLabel = (status: OrderStatus) => status.replaceAll("_", " ");
