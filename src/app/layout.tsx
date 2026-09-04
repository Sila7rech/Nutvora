import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store";

export const metadata: Metadata = {
  title: "NUTVORA — Fruits Secs, Fruits Séchés & Boissons Naturelles",
  description: "Découvrez les mélanges premium NUTVORA, fruits secs, fruits séchés et boissons naturelles, livrés partout en Tunisie.",
  openGraph: { title: "NUTVORA — Snack Better. Feel Better.", description: "Des snacks premium soigneusement sélectionnés.", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
