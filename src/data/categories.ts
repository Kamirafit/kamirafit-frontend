import type { AdminCategory } from "@/types/entities";
export type { AdminCategory } from "@/types/entities";

export const CATEGORIES: AdminCategory[] = [
  {
    id: "c-01",
    name: "Indian",
    subcategories: ["Kurti"],
  },
  {
    id: "c-02",
    name: "Indo-western",
    subcategories: ["Co-ords Sets"],
  },
  {
    id: "c-03",
    name: "Western",
    subcategories: ["Dresses"],
  },
  {
    id: "c-04",
    name: "Unisex T-Shirts",
    subcategories: ["T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
];
