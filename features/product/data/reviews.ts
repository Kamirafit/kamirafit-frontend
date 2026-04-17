import type { Review } from "../types";

const REVIEWS_BY_PRODUCT: Record<string, Review[]> = {
  "p-01": [
    {
      id: "r-01-1",
      author: "Ananya S.",
      rating: 5,
      comment:
        "Fabric is buttery soft and the oversized fit falls exactly right. Worth every rupee.",
      date: "2026-04-10",
    },
    {
      id: "r-01-2",
      author: "Rohan M.",
      rating: 5,
      comment: "Honestly the best basic tee I own now. Wash-and-wear durability feels premium.",
      date: "2026-04-02",
    },
    {
      id: "r-01-3",
      author: "Priya K.",
      rating: 4,
      comment: "Loved the ivory tone. A touch sheer in sunlight, otherwise flawless.",
      date: "2026-03-25",
    },
    {
      id: "r-01-4",
      author: "Dev R.",
      rating: 5,
      comment: "Excellent length, clean neckline. Pairs with everything I own.",
      date: "2026-03-18",
    },
    {
      id: "r-01-5",
      author: "Meera J.",
      rating: 4,
      comment: "Sizing runs true to the chart. Relaxed but not boxy — perfect.",
      date: "2026-03-05",
    },
  ],
  "p-02": [
    {
      id: "r-02-1",
      author: "Karan B.",
      rating: 5,
      comment: "Heavyweight cotton, deep hood, clean stitching. Premium feel throughout.",
      date: "2026-04-12",
    },
    {
      id: "r-02-2",
      author: "Sana T.",
      rating: 5,
      comment: "The black is a proper black — not faded or blueish. Love it.",
      date: "2026-04-04",
    },
    {
      id: "r-02-3",
      author: "Vikram P.",
      rating: 4,
      comment: "Warm without being bulky. Sleeves could be a hair longer on me.",
      date: "2026-03-27",
    },
    {
      id: "r-02-4",
      author: "Ishita L.",
      rating: 5,
      comment: "My new weekend uniform. Gets compliments every time I wear it.",
      date: "2026-03-14",
    },
    {
      id: "r-02-5",
      author: "Arjun G.",
      rating: 5,
      comment: "Kangaroo pocket is spacious and the drawcords don't fray.",
      date: "2026-03-02",
    },
  ],
  "p-03": [
    {
      id: "r-03-1",
      author: "Neha D.",
      rating: 5,
      comment: "Classic crewneck that fits like it was tailored. Soft from day one.",
      date: "2026-04-09",
    },
    {
      id: "r-03-2",
      author: "Siddharth R.",
      rating: 4,
      comment: "Great everyday layer. Colour held up after multiple washes.",
      date: "2026-03-30",
    },
    {
      id: "r-03-3",
      author: "Tara V.",
      rating: 4,
      comment: "Honest, no-nonsense tee. Fit is regular — not oversized, not slim.",
      date: "2026-03-20",
    },
    {
      id: "r-03-4",
      author: "Aarav N.",
      rating: 5,
      comment: "Exactly what I wanted as a base layer. Will re-order in every colour.",
      date: "2026-03-08",
    },
    {
      id: "r-03-5",
      author: "Kavya I.",
      rating: 5,
      comment: "Holds shape beautifully. Neckline sits flat without curling.",
      date: "2026-02-26",
    },
  ],
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r-default-1",
    author: "Aditya V.",
    rating: 5,
    comment:
      "Love the fabric weight — doesn't feel cheap like most e-commerce tees I've ordered.",
    date: "2026-04-08",
  },
  {
    id: "r-default-2",
    author: "Riya S.",
    rating: 4,
    comment: "Fits as described on the size chart. The colour is true to the photos.",
    date: "2026-03-28",
  },
  {
    id: "r-default-3",
    author: "Harsh J.",
    rating: 5,
    comment: "Great silhouette and the stitching is clean inside-out. Keeper.",
    date: "2026-03-18",
  },
  {
    id: "r-default-4",
    author: "Mira K.",
    rating: 4,
    comment: "Soft and lightweight. Perfect layering piece for our weather.",
    date: "2026-03-05",
  },
  {
    id: "r-default-5",
    author: "Yash B.",
    rating: 5,
    comment: "Shipping was fast and the product exceeded expectations. Recommended.",
    date: "2026-02-22",
  },
];

export function getReviewsFor(productId: string): Review[] {
  return REVIEWS_BY_PRODUCT[productId] ?? DEFAULT_REVIEWS;
}
