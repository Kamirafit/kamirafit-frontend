import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
export const wishlistService = {
 getWishlist:()=>unwrapApiResponse<{productIds:string[]}>(apiClient.get("/wishlist")).then(x=>x.productIds),
 updateWishlist:(productIds:string[])=>unwrapApiResponse<{productIds:string[]}>(apiClient.put("/wishlist",{productIds})).then(x=>x.productIds),
 toggleWishlist:(productId:string)=>unwrapApiResponse<{productIds:string[]}>(apiClient.post("/wishlist/toggle",{productId})).then(x=>x.productIds),
};
export function useWishlist(enabled = true){return useQuery<string[]>({queryKey:["wishlist"],queryFn:wishlistService.getWishlist,staleTime:300000,enabled:enabled && typeof window!=="undefined"});}
export function useToggleWishlist(){const q=useQueryClient();return useMutation({mutationFn:wishlistService.toggleWishlist,onSuccess:d=>q.setQueryData(["wishlist"],d)});}
export function useUpdateWishlist(){const q=useQueryClient();return useMutation({mutationFn:wishlistService.updateWishlist,onSuccess:d=>q.setQueryData(["wishlist"],d)});}
