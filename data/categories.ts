export type AdminCategory = {
  id: string;
  name: string;
  subcategories: string[];
};

export const CATEGORIES: AdminCategory[] = [
  {
    id: "c-01",
    name: "Oversized",
    subcategories: ["Tees", "Long Tees", "Polos"],
  },
  {
    id: "c-02",
    name: "Regular",
    subcategories: ["Tees", "Crewnecks", "Polos"],
  },
  {
    id: "c-03",
    name: "Hoodies",
    subcategories: ["Pullover", "Full Zip", "Cropped"],
  },
];
