import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Review } from "@/types/entities";
import type { CreateReviewRequestDto } from "@/types/api/reviews";

export interface ReviewEligibility {
  eligible: boolean;
  reason?: "NOT_AUTHENTICATED" | "NOT_PURCHASED" | "NOT_DELIVERED" | "ALREADY_REVIEWED";
  message: string;
}

export const reviewService = {
  getReviews: (productId: string) =>
    unwrapApiResponse<Review[]>(apiClient.get("/orders/reviews", { params: { productId } })),
  checkEligibility: (productId: string) =>
    unwrapApiResponse<ReviewEligibility>(apiClient.get("/orders/reviews/eligibility", { params: { productId } })),
  createReview: (review: CreateReviewRequestDto) =>
    unwrapApiResponse<Review>(apiClient.post("/orders/reviews", review)),
};

export function useReviews(productId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.getReviews(productId),
    enabled: !!productId,
    staleTime: 120000,
  });
}

export function useReviewEligibility(productId: string, enabled = true) {
  return useQuery<ReviewEligibility>({
    queryKey: ["reviewEligibility", productId],
    queryFn: () => reviewService.checkEligibility(productId),
    enabled: Boolean(productId) && enabled,
    staleTime: 60000,
  });
}

export function useCreateReview() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: (d) => {
      q.invalidateQueries({ queryKey: ["reviews", d.productId] });
      q.invalidateQueries({ queryKey: ["product", d.productId] });
      q.invalidateQueries({ queryKey: ["reviewEligibility", d.productId] });
    },
  });
}
