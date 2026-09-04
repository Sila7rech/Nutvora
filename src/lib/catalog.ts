export type Product = {
  id: string;
  name: string;
  format: string;
  detail: string;
  price: number;
  image: string;
  category: "Mix" | "Fruits secs" | "Fruits séchés" | "Coffrets";
  badge?: string;
  description: string;
};

export const products: Product[] = [
  { id: "energy-50", name: "Energy Mix", format: "50G", detail: "Amande, cajou, noix & fruits séchés", price: 12.9, image: "/Grab&Go-50g.png", category: "Mix", badge: "Bestseller", description: "Un mélange équilibré d'amandes, cajous, noix et fruits séchés. Le format nomade idéal pour une pause pleine de caractère." },
  { id: "energy-100", name: "Energy Mix", format: "100G", detail: "Le mix qui accompagne vos journées", price: 21.9, image: "/Standard-100g.png", category: "Mix", badge: "Préféré", description: "Une généreuse composition NUTVORA pour accompagner vos journées, à partager ou à garder près de soi." },
  { id: "family-200", name: "Family / Premium", format: "200G", detail: "Un généreux mélange à partager", price: 36.9, image: "/Family-Premium-200g.png", category: "Mix", description: "Notre grand format signature, composé pour les moments qui se prolongent et se partagent." },
  { id: "discovery", name: "Discovery Box", format: "4 x 50G", detail: "Une sélection NUTVORA à offrir", price: 54.9, image: "/Family-Premium-200g.png", category: "Coffrets", badge: "Coffret", description: "Une sélection découverte des recettes emblématiques de la maison NUTVORA, réunies dans un coffret à offrir." },
];

export const getProduct = (id: string) => products.find((product) => product.id === id);
export const formatPrice = (price: number) => `${price.toFixed(2).replace(".", ",")} TND`;
