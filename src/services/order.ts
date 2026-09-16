import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export interface CouponValidationResult {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  discountAmount: number;
  maxDiscount?: number | null;
  minOrderVal?: number | null;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const orderService = {
  getOrders: () => unwrapApiResponse<Order[]>(apiClient.get("/orders")),
  getOrder: (id: string) => unwrapApiResponse<Order>(apiClient.get("/orders/" + id)),
  downloadInvoice: (orderId: string) => apiClient.get(`/orders/${orderId}/invoice`, { responseType: "blob" }),
  getDeliveryEstimate: (params: { postalCode: string; country?: string; weight?: number; isCod?: boolean }) =>
    unwrapApiResponse<DeliveryEstimateResult>(apiClient.post("/orders/delivery-estimate", params)),
  validateCoupon: (params: { code: string; subtotal: number; items?: unknown[] }) =>
    unwrapApiResponse<CouponValidationResult>(apiClient.post("/orders/validate-coupon", params)),
  verifyPayment: (params: VerifyPaymentPayload) =>
    unwrapApiResponse<Order>(apiClient.post("/orders/verify-payment", params)),
  getTracking: (id: string) =>
    unwrapApiResponse<OrderTrackingResponse>(apiClient.get(`/orders/${id}/tracking`)),
  cancelOrder: (id: string, reason?: string) =>
    unwrapApiResponse<Order>(apiClient.post(`/orders/${id}/cancel`, { reason })),
  requestReturn: (id: string, reason: string, comments?: string) =>
    unwrapApiResponse<Order>(apiClient.post(`/orders/${id}/return`, { reason, comments })),
};

export interface TrackingMilestone {
  name: string;
  statusKey: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
  description: string;
}

export interface TrackingScan {
  date?: string;
  activity?: string;
  location?: string;
  status?: string;
  "sr-status-label"?: string;
}

export interface OrderTrackingResponse {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  courierName?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  currentStatus: string;
  etd?: string | null;
  destination?: string | null;
  milestones: TrackingMilestone[];
  scans: TrackingScan[];
}

export function useOrders() {
  return useQuery<Order[]>({ queryKey: ["orders"], queryFn: orderService.getOrders, staleTime: 60000 });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: orderService.verifyPayment,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRequestReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, comments }: { id: string; reason: string; comments?: string }) =>
      orderService.requestReturn(id, reason, comments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOrderTracking(id: string | null | undefined) {
  return useQuery<OrderTrackingResponse>({
    queryKey: ["orders", id, "tracking"],
    queryFn: () => orderService.getTracking(id!),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}


