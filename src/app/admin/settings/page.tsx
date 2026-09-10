import { CatalogModuleView } from "@/components/admin-module-view";
import { PreferencesMenu } from "@/lib/i18n";
export default function SettingsPage() { return <><div className="admin-settings-preferences"><PreferencesMenu /></div><CatalogModuleView title="Settings" eyebrow="Store configuration" copy="Manage store, delivery, payments and team preferences." items={["General", "Payments · Cash on delivery", "Delivery zones", "Notifications", "SEO", "Social media"]} /></>; }
