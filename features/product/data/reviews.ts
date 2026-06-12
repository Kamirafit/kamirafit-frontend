import type { Review } from "../types";

type SeedReview = Omit<Review, "productId" | "images">;

const REVIEWS_BY_PRODUCT: Record<string, SeedReview[]> = {
  "p-01": [
    {
      id: "r-01-1",
      customerName: "Ananya S.",
      rating: 5,
      title: "Falls exactly right",
      comment:
        "Fabric is buttery soft and the oversized fit falls exactly right. Worth every rupee.",
      createdAt: "2026-04-10",
    },
    {
      id: "r-01-2",
      customerName: "Rohan M.",
      rating: 5,
      title: "Best basic tee",
      comment:
        "Honestly the best basic tee I own now. Wash-and-wear durability feels premium.",
      createdAt: "2026-04-02",
    },
    {
      id: "r-01-3",
      customerName: "Priya K.",
      rating: 4,
      comment: "Loved the ivory tone. A touch sheer in sunlight, otherwise flawless.",
      createdAt: "2026-03-25",
    },
    {
      id: "r-01-4",
      customerName: "Dev R.",
      rating: 5,
      comment: "Excellent length, clean neckline. Pairs with everything I own.",
      createdAt: "2026-03-18",
    },
    {
      id: "r-01-5",
      customerName: "Meera J.",
      rating: 4,
      title: "True to size",
      comment: "Sizing runs true to the chart. Relaxed but not boxy - perfect.",
      createdAt: "2026-03-05",
    },
  ],
  "p-02": [
    {
      id: "r-02-1",
      customerName: "Karan B.",
      rating: 5,
      title: "Premium feel",
      comment: "Heavyweight cotton, deep hood, clean stitching. Premium feel throughout.",
      createdAt: "2026-04-12",
    },
    {
      id: "r-02-2",
      customerName: "Sana T.",
      rating: 5,
      comment: "The black is a proper black - not faded or blueish. Love it.",
      createdAt: "2026-04-04",
    },
    {
      id: "r-02-3",
      customerName: "Vikram P.",
      rating: 4,
      comment: "Warm without being bulky. Sleeves could be a hair longer on me.",
      createdAt: "2026-03-27",
    },
    {
      id: "r-02-4",
      customerName: "Ishita L.",
      rating: 5,
      title: "Weekend uniform",
      comment: "My new weekend uniform. Gets compliments every time I wear it.",
      createdAt: "2026-03-14",
    },
    {
      id: "r-02-5",
      customerName: "Arjun G.",
      rating: 5,
      comment: "Kangaroo pocket is spacious and the drawcords don't fray.",
      createdAt: "2026-03-02",
    },
  ],
  "p-03": [
    {
      id: "r-03-1",
      customerName: "Neha D.",
      rating: 5,
      title: "Tailored feel",
      comment: "Classic crewneck that fits like it was tailored. Soft from day one.",
      createdAt: "2026-04-09",
    },
    {
      id: "r-03-2",
      customerName: "Siddharth R.",
      rating: 4,
      comment: "Great everyday layer. Colour held up after multiple washes.",
      createdAt: "2026-03-30",
    },
    {
      id: "r-03-3",
      customerName: "Tara V.",
      rating: 4,
      comment: "Honest, no-nonsense tee. Fit is regular - not oversized, not slim.",
      createdAt: "2026-03-20",
    },
    {
      id: "r-03-4",
      customerName: "Aarav N.",
      rating: 5,
      title: "Will reorder",
      comment: "Exactly what I wanted as a base layer. Will re-order in every colour.",
      createdAt: "2026-03-08",
    },
    {
      id: "r-03-5",
      customerName: "Kavya I.",
      rating: 5,
      comment: "Holds shape beautifully. Neckline sits flat without curling.",
      createdAt: "2026-02-26",
    },
  ],
};

const DEFAULT_REVIEWS: SeedReview[] = [
  {
    id: "r-default-1",
    customerName: "Aditya V.",
    rating: 5,
    title: "Great fabric weight",
    comment:
      "Love the fabric weight - doesn't feel cheap like most e-commerce tees I've ordered.",
    createdAt: "2026-04-08",
  },
  {
    id: "r-default-2",
    customerName: "Riya S.",
    rating: 4,
    comment: "Fits as described on the size chart. The colour is true to the photos.",
    createdAt: "2026-03-28",
  },
  {
    id: "r-default-3",
    customerName: "Harsh J.",
    rating: 5,
    title: "Clean stitching",
    comment: "Great silhouette and the stitching is clean inside-out. Keeper.",
    createdAt: "2026-03-18",
  },
  {
    id: "r-default-4",
    customerName: "Mira K.",
    rating: 4,
    comment: "Soft and lightweight. Perfect layering piece for our weather.",
    createdAt: "2026-03-05",
  },
  {
    id: "r-default-5",
    customerName: "Yash B.",
    rating: 5,
    comment: "Shipping was fast and the product exceeded expectations. Recommended.",
    createdAt: "2026-02-22",
  },
];

function withProductData(review: SeedReview, productId: string): Review {
  return {
    ...review,
    productId,
    images: [],
  };
}

export function getReviewsFor(productId: string): Review[] {
  return (REVIEWS_BY_PRODUCT[productId] ?? DEFAULT_REVIEWS).map((review) =>
    withProductData(review, productId),
  );
}
