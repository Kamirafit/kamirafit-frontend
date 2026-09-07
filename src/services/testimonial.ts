import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type {
  Testimonial,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "@/types/entities";

export const testimonialService = {
  getPublic: async (): Promise<Testimonial[]> => {
    return unwrapApiResponse<Testimonial[]>(apiClient.get("/testimonials"));
  },
  getAdminList: async (): Promise<Testimonial[]> => {
    return unwrapApiResponse<Testimonial[]>(apiClient.get("/admin/testimonials"));
  },
  create: async (data: CreateTestimonialInput): Promise<Testimonial> => {
    return unwrapApiResponse<Testimonial>(apiClient.post("/admin/testimonials", data));
  },
  update: async (id: string, data: UpdateTestimonialInput): Promise<Testimonial> => {
    return unwrapApiResponse<Testimonial>(apiClient.put(`/admin/testimonials/${id}`, data));
  },
  delete: async (id: string): Promise<{ id: string }> => {
    return unwrapApiResponse<{ id: string }>(apiClient.delete(`/admin/testimonials/${id}`));
  },
  reorder: async (orderedIds: string[]): Promise<Testimonial[]> => {
    return unwrapApiResponse<Testimonial[]>(
      apiClient.put("/admin/testimonials/reorder", { orderedIds })
    );
  },
};

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: testimonialService.getPublic,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["adminTestimonials"],
    queryFn: testimonialService.getAdminList,
    staleTime: 60 * 1000,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testimonialService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialInput }) =>
      testimonialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testimonialService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
    },
  });
}

export function useReorderTestimonials() {
  const queryClient = useQueryClient();
  return useMutation<
    Testimonial[],
    Error,
    string[],
    { previousData?: Testimonial[] }
  >({
    mutationFn: testimonialService.reorder,
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["adminTestimonials"] });
      const previousData = queryClient.getQueryData<Testimonial[]>(["adminTestimonials"]);

      if (previousData) {
        // Optimistically reorder list in cache
        const map = new Map(previousData.map((item) => [item.id, item]));
        const nextData: Testimonial[] = [];
        orderedIds.forEach((id, idx) => {
          const item = map.get(id);
          if (item) {
            nextData.push({ ...item, order: idx });
          }
        });
        queryClient.setQueryData(["adminTestimonials"], nextData);
      }

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["adminTestimonials"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["adminTestimonials"] });
    },
  });
}
