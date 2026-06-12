export type MegaMenuColumn = {
  title: string;
  items: { label: string; href: string }[];
};

/**
 * Categories mega menu data — single source of truth, shared by the navbar
 * (client) and the footer (server). Kept in a plain .ts module (no "use
 * client") so both contexts can import it without the Next.js client/server
 * boundary wrapping the constant.
 */
export const CATEGORY_COLUMNS: MegaMenuColumn[] = [
  {
    title: "Indian",
    items: [{ label: "Kurti", href: "/shop?category=kurti" }],
  },
  {
    title: "Indo-western",
    items: [{ label: "Co-ords sets", href: "/shop?category=co-ords-sets" }],
  },
  {
    title: "Western",
    items: [{ label: "Dresses", href: "/shop?category=dresses" }],
  },
  {
    title: "Unisex T-shirts",
    items: [
      { label: "T-shirts", href: "/shop?category=tshirts" },
      { label: "Oversized T-shirts", href: "/shop?category=oversized-tshirts" },
      { label: "Hoodies", href: "/shop?category=hoodies" },
    ],
  },
];
