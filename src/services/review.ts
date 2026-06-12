import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Review } from "@/types/api";
import { getProductById } from "@/features/product/data/products";

export const reviewService = {
  getReviews: async (productId: string): Promise<Review[]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    const product = getProductById(productId);
    return product ? (product.reviews as unknown as Review[]) : [];
  },

  createReview: async (review: Omit<Review, "id" | "createdAt" | "customerName">): Promise<Review> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      customerName: "Anonymous",
      createdAt: new Date().toISOString(),
    };
    return newReview;
  },
};

export function useReviews(productId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.getReviews(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, Omit<Review, "id" | "createdAt" | "customerName">>({
    mutationFn: reviewService.createReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", data.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", data.productId] });
    },
  });
}
