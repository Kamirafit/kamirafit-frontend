import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Order } from "@/types/entities";

export interface ShippingOptionDetail {
  type: "STANDARD" | "PRIME";
  title: string;
  courierName: string;
  estimatedDays: number;
  estimatedDate: string;
  isoEstimatedDate: string;
  rate: number;
  currency: string;
  isFree: boolean;
  description: string;
}

export interface DeliveryEstimateResult {
  postalCode: string;
  country: string;
  isDomestic: boolean;
  standard: ShippingOptionDetail;
  prime: ShippingOptionDetail;
  cheapestMethod: "STANDARD" | "PRIME";
  fastestMethod: "STANDARD" | "PRIME";
}

export const orderService = {
  getOrders: () => unwrapApiResponse<Order[]>(apiClient.get("/orders")),
  getOrder: (id: string) => unwrapApiResponse<Order>(apiClient.get("/orders/" + id)),
  downloadInvoice: (orderId: string) => apiClient.get(`/orders/${orderId}/invoice`, { responseType: "blob" }),
  getDeliveryEstimate: (params: { postalCode: string; country?: string; weight?: number; isCod?: boolean }) =>
    unwrapApiResponse<DeliveryEstimateResult>(apiClient.post("/orders/delivery-estimate", params)),
};

export function useOrders() {
  return useQuery<Order[]>({ queryKey: ["orders"], queryFn: orderService.getOrders, staleTime: 60000 });
}

