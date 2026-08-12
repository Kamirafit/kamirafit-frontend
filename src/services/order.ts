import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Order } from "@/types/entities";
export const orderService = {
 getOrders:()=>unwrapApiResponse<Order[]>(apiClient.get("/orders")),
 getOrder:(id:string)=>unwrapApiResponse<Order>(apiClient.get("/orders/"+id)),
};
export function useOrders(){return useQuery<Order[]>({queryKey:["orders"],queryFn:orderService.getOrders,staleTime:60000});}
