import type { ProductEntity, Variant, Inventory } from "@/types/entities";
import { getReviewsFor } from "./reviews";

const ALT_IMAGES = {
  "Oversized T-Shirts": [
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  ],
  "T-Shirts": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80",
  ],
  Kurti: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  ],
  "Co-ords Sets": [
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  ],
  Dresses: [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  ],
  Hoodies: [
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=800&q=80",
  ],
} as const;

type Seed = {
  id: string;
  name: string;
  price: number;
  category: "Oversized T-Shirts" | "Hoodies" | "T-Shirts" | "Kurti" | "Co-ords Sets" | "Dresses";
  size: ("XS" | "S" | "M" | "L" | "XL" | "2XL")[];
  color: ("Black" | "White" | "Blue" | "Red" | "Green" | "Pink" | "Beige" | "Maroon" | "Navy" | "Yellow" | "Grey")[];
  rating: number;
  image: string;
  createdAt: string;
  popularity: number;
  description: string;
};

const SEED: Seed[] = [
  {
    id: "p-01",
    name: "Ivory Oversized Tee",
    price: 799,
    category: "Oversized T-Shirts",
    size: ["S", "M", "L", "XL"],
    color: ["White"],
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-28",
    popularity: 92,
    description:
      "A soft, breathable 240gsm cotton tee cut for a relaxed, everyday silhouette. Dropped shoulders, ribbed crew neck and a clean hem — our go-to ivory layer for any fit.",
  },
  {
    id: "p-02",
    name: "Midnight Relaxed Hoodie",
    price: 1799,
    category: "Hoodies",
    size: ["M", "L", "XL"],
    color: ["Black"],
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-15",
    popularity: 98,
    description:
      "A heavyweight brushed-fleece hoodie in deep midnight black. Double-lined hood, kangaroo pocket and ribbed cuffs — built for year-round layering without ever losing shape.",
  },
  {
    id: "p-03",
    name: "Stone Everyday Crewneck",
    price: 1299,
    category: "T-Shirts",
    size: ["S", "M", "L"],
    color: ["White", "Black"],
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-02-20",
    popularity: 88,
    description:
      "A clean-lined crewneck in a soft stone-washed cotton blend. Regular fit through the body with set-in sleeves — the quiet essential that upgrades every outfit.",
  },
  {
    id: "p-04",
    name: "Sand Regular Fit Tee",
    price: 649,
    category: "T-Shirts",
    size: ["S", "M", "L", "XL"],
    color: ["White", "Blue"],
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-30",
    popularity: 81,
    description:
      "Lightweight 180gsm combed cotton in a versatile sand tone. Regular fit with a short sleeve and a slim crew neck — our answer to the perfect weekday tee.",
  },
  {
    id: "p-05",
    name: "Cobalt Oversized Tee",
    price: 899,
    category: "Oversized T-Shirts",
    size: ["M", "L", "XL"],
    color: ["Blue"],
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-10",
    popularity: 74,
    description:
      "Saturated cobalt on a garment-washed oversized silhouette. Boxy, dropped-shoulder fit with a bit of length — a standout staple without being loud.",
  },
  {
    id: "p-06",
    name: "Crimson Panel Hoodie",
    price: 1999,
    category: "Hoodies",
    size: ["S", "M", "L", "XL"],
    color: ["Red"],
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1618354691249-18772bbac3c5?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-02",
    popularity: 95,
    description:
      "A sculpted, slightly cropped hoodie in deep crimson with subtle panelling through the chest. Premium fleece inside, structured shoulders outside.",
  },
  {
    id: "p-07",
    name: "Noir Boxy Tee",
    price: 749,
    category: "Oversized T-Shirts",
    size: ["S", "M", "L"],
    color: ["Black"],
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-01-18",
    popularity: 67,
    description:
      "A true black, boxy-cut tee with reinforced shoulder seams. Heavier handfeel than a basic tee — holds its shape wash after wash.",
  },
  {
    id: "p-08",
    name: "Signal Red Regular Tee",
    price: 699,
    category: "T-Shirts",
    size: ["M", "L", "XL"],
    color: ["Red"],
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-02-05",
    popularity: 71,
    description:
      "A loud, honest red on a regular-fit cotton tee. Classic proportions, trimmed neckline and a soft finish — a clean statement layer.",
  },
  {
    id: "p-09",
    name: "Porcelain Zip Hoodie",
    price: 1899,
    category: "Hoodies",
    size: ["S", "M", "L"],
    color: ["White"],
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-22",
    popularity: 84,
    description:
      "A crisp porcelain-white full-zip hoodie with a brushed interior. YKK zip, lined hood and a straight hem — a polished take on an everyday classic.",
  },
  {
    id: "p-10",
    name: "Deep Blue Regular Tee",
    price: 849,
    category: "T-Shirts",
    size: ["S", "M", "L", "XL"],
    color: ["Blue"],
    rating: 4.0,
    image:
      "https://images.unsplash.com/photo-1618354691321-e851c5c3a990?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-02-28",
    popularity: 62,
    description:
      "A deep, saturated blue on a regular-fit tee. Versatile enough for work, clean enough for weekends. Made from long-staple cotton with minimal shrinkage.",
  },
  {
    id: "p-11",
    name: "Ash Oversized Long Tee",
    price: 999,
    category: "Oversized T-Shirts",
    size: ["M", "L", "XL"],
    color: ["Black", "White"],
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-08",
    popularity: 90,
    description:
      "An elongated, ash-toned oversized tee with a curved hem. Layers cleanly over shorts or under jackets without bunching.",
  },
  {
    id: "p-12",
    name: "Carbon Pullover Hoodie",
    price: 1599,
    category: "Hoodies",
    size: ["S", "M", "L", "XL"],
    color: ["Black", "Blue"],
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-05",
    popularity: 89,
    description:
      "A carbon-grey pullover hoodie with a mid-weight loopback fabric. Comfortable enough for cool mornings, structured enough to wear out.",
  },
  {
    id: "p-13",
    name: "Snow Regular Crewneck",
    price: 1199,
    category: "T-Shirts",
    size: ["S", "M", "L"],
    color: ["White"],
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-01-30",
    popularity: 65,
    description:
      "A bright snow-white crewneck sweatshirt with a soft brushed interior. Regular fit, ribbed trims and a timeless silhouette.",
  },
  {
    id: "p-14",
    name: "Azure Oversized Tee",
    price: 899,
    category: "Oversized T-Shirts",
    size: ["S", "M", "L", "XL"],
    color: ["Blue", "White"],
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-01",
    popularity: 78,
    description:
      "A washed-azure oversized tee with a breezy drape. Dropped shoulders, longer body and a smooth handfeel — our answer to effortless summer layering.",
  },
  {
    id: "p-15",
    name: "Gulabi Chanderi Embroidered Kurti",
    price: 1499,
    category: "Kurti",
    size: ["S", "M", "L", "XL"],
    color: ["Pink", "Red"],
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-12",
    popularity: 96,
    description:
      "A pure Chanderi silk kurti with delicate gold zari embroidery on the yoke and sleeve cuffs. Breathable cotton lining, side slits and a graceful straight cut suited for festive gatherings and workwear alike.",
  },
  {
    id: "p-16",
    name: "Kashmiri Chikankari Straight Kurti",
    price: 1299,
    category: "Kurti",
    size: ["S", "M", "L", "XL"],
    color: ["White", "Blue"],
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-05",
    popularity: 91,
    description:
      "Handcrafted fine Chikankari needlework across airy modal cotton. Features an intricate floral jaal pattern, round notched neck and comfortable calf-length silhouette.",
  },
  {
    id: "p-17",
    name: "Earthy Linen Relaxed Co-ord Set",
    price: 2199,
    category: "Co-ords Sets",
    size: ["S", "M", "L", "XL"],
    color: ["Beige", "Green"],
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-15",
    popularity: 97,
    description:
      "A two-piece tailored co-ord set made from washed natural linen. Includes a relaxed button-front shirt with drop shoulders and matching high-waisted wide-leg trousers with an elasticated back waistband.",
  },
  {
    id: "p-18",
    name: "Boho Resort Printed Co-ord Set",
    price: 1899,
    category: "Co-ords Sets",
    size: ["S", "M", "L", "XL"],
    color: ["Blue", "Red"],
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-03-29",
    popularity: 88,
    description:
      "A vibrant printed resort-wear co-ord set featuring a cropped wrap top and tiered palazzo pants in fluid viscose fabric. Lightweight, breezy, and effortlessly chic for casual outings and vacations.",
  },
  {
    id: "p-19",
    name: "Aura Tiered Floral Midi Dress",
    price: 1699,
    category: "Dresses",
    size: ["XS", "S", "M", "L", "XL"],
    color: ["Red", "Pink"],
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-14",
    popularity: 93,
    description:
      "A romantic tiered midi dress with subtle sweetheart neckline and flutter sleeves. Cut from breathable georgette with an all-over floral print and a soft inner lining for effortless day-to-evening style.",
  },
  {
    id: "p-20",
    name: "Satin Drape Evening Dress",
    price: 1999,
    category: "Dresses",
    size: ["S", "M", "L", "XL"],
    color: ["Black", "Blue"],
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-04-09",
    popularity: 94,
    description:
      "A sleek cowl-neck midi dress crafted from heavy liquid-satin fabric. Features adjustable spaghetti straps, an asymmetrical side slit and a bias cut that contours naturally over the body.",
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export const PRODUCTS: ProductEntity[] = SEED.map((p) => {
  const categorySlug = slugify(p.category);
  const brand = "KamiraFit";
  const variants: Variant[] = [];
  let varIdx = 1;

  p.color.forEach((color) => {
    p.size.forEach((size) => {
      const variantId = `${p.id}-v${varIdx.toString().padStart(2, "0")}`;
      varIdx++;

      const quantity = Math.floor(Math.random() * 40) + 10;
      const reserved = Math.floor(Math.random() * 5);
      const inventory: Inventory = {
        quantity,
        reserved,
        available: quantity - reserved,
      };

      let price = p.price;
      let salePrice: number | undefined = undefined;

      if (size === "XL") {
        price += 100;
      }

      if (p.id === "p-01" && color === "White" && size === "M") {
        salePrice = price - 100;
      }

      const sku = `KF-${categorySlug.toUpperCase().slice(0, 3)}-${p.id.toUpperCase()}-${color.toUpperCase()}-${size}`;

      variants.push({
        id: variantId,
        sku,
        color,
        size,
        inventory,
        price,
        salePrice,
        images: [p.image, ...ALT_IMAGES[p.category]],
        isAvailable: inventory.available > 0,
      });
    });
  });

  return {
    id: p.id,
    title: p.name,
    slug: slugify(p.name),
    description: p.description,
    category: p.category,
    brand,
    status: "active" as const,
    variants,
    metadata: {
      rating: p.rating,
      reviews: getReviewsFor(p.id),
      popularity: p.popularity,
      createdAt: p.createdAt + "T00:00:00Z",
    },
  };
});

export function getProductById(id: string): ProductEntity | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(id: string, limit = 4): ProductEntity[] {
  const current = getProductById(id);
  if (!current) return PRODUCTS.slice(0, limit);
  return PRODUCTS.filter(
    (p) => p.id !== id && p.category === current.category,
  )
    .concat(PRODUCTS.filter((p) => p.id !== id && p.category !== current.category))
    .slice(0, limit);
}
