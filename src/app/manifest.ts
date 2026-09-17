import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KamiraFit — Designer Apparel & Clothing",
    short_name: "KamiraFit",
    description: "Shop handcrafted kurtis, matching co-ord sets, dresses, and luxury streetwear essentials at KamiraFit.",
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#8B1E2D",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
