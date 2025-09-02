import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Seen Group",
  description: "Browse our comprehensive collection of parts and components by category. Find high-quality products to supply your business growth.",
  keywords: [
    "products",
    "parts",
    "components",
    "business supplies",
    "industrial parts",
    "manufacturing components",
    "Seen Group products"
  ],
  openGraph: {
    title: "Products - Seen Group",
    description: "Browse our comprehensive collection of parts and components by category.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products - Seen Group",
    description: "Browse our comprehensive collection of parts and components by category.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

