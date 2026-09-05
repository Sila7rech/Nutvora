import { CatalogModuleView } from "@/components/admin-module-view";
export default function SettingsPage() { return <CatalogModuleView title="Settings" eyebrow="Store configuration" copy="Manage store, delivery, payments and team preferences." items={["General", "Payments · Cash on delivery", "Delivery zones", "Notifications", "SEO", "Social media"]} />; }
