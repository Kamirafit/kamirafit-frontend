import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Review } from "@/types/entities";
import type { CreateReviewRequestDto, CreateReviewResponseDto, GetReviewsResponseDto } from "@/types/api/reviews";

export const reviewService = {
  getReviews: async (productId: string): Promise<GetReviewsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.reviews.getAll(productId));
  },

  createReview: async (review: CreateReviewRequestDto): Promise<CreateReviewResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.reviews.create(review));
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
