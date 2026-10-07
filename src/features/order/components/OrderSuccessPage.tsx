"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useOrder, useOrders, orderService } from "@/services/order";
import { useProfile } from "@/features/auth/hooks";
import { useAppSelector } from "@/features/product/hooks/redux";
import type { Order } from "@/types/entities";
import OrderConfirmationHero from "./OrderConfirmationHero";
import DeliveryAddressCard from "./DeliveryAddressCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import ShipmentInfoCard from "./ShipmentInfoCard";
import OrderItemsCard from "./OrderItemsCard";
import InvoiceToast from "./InvoiceToast";
import OrderSuccessSkeleton from "./OrderSuccessSkeleton";
import OrderSuccessError from "./OrderSuccessError";
import OrderTrackingModal from "@/features/account/components/OrderTrackingModal";

type OrderSuccessPageProps = {
  orderId?: string | null;
  initialOrder?: Order | null;
  fallbackRecipientName?: string;
  fallbackTotal?: number;
  fallbackPaymentMethod?: string;
};

export default function OrderSuccessPage({
  orderId: propOrderId,
  initialOrder,
  fallbackRecipientName,
  fallbackTotal,
  fallbackPaymentMethod,
}: OrderSuccessPageProps) {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams?.get("orderId") || searchParams?.get("id");
  const effectiveOrderId = propOrderId || queryOrderId || null;

  // Authenticated user state
  const authUser = useAppSelector((s) => s.auth.user);
  const { data: profile } = useProfile();
  const accountUser = profile || authUser;

  // Order data query
  const {
    data: fetchedOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch,
  } = useOrder(effectiveOrderId);

  // If no orderId was supplied in the URL, optionally check recent orders
  const { data: ordersList = [], isLoading: isOrdersListLoading } = useOrders();

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [toastInvoiceNumber, setToastInvoiceNumber] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState<string | null>(null);

  // Authoritative Order Resolution
  const order: (Order & Record<string, unknown>) | null = useMemo(() => {
    if (initialOrder) return initialOrder as Order & Record<string, unknown>;
    if (fetchedOrder) return fetchedOrder as Order & Record<string, unknown>;
    if (!effectiveOrderId && ordersList.length > 0) {
      // Pick the most recent order from the user's account
      return ordersList[0] as Order & Record<string, unknown>;
    }
    return null;
  }, [initialOrder, fetchedOrder, effectiveOrderId, ordersList]);

  // Loading state
  const isResolving = effectiveOrderId
    ? isOrderLoading && !order
    : isOrdersListLoading && !order;

  if (isResolving) {
    return <OrderSuccessSkeleton />;
  }

  // Error state if order cannot be resolved
  if (!order && (isOrderError || (!effectiveOrderId && ordersList.length === 0))) {
    return (
      <OrderSuccessError
        onRetry={effectiveOrderId ? () => void refetch() : undefined}
        message={
          effectiveOrderId
            ? "We were unable to retrieve the details for order #" + effectiveOrderId + ". Please verify your network connection or view your account orders."
            : "No order ID was specified. Please view your past orders or return to the shop."
        }
      />
    );
  }

  // Determine Customer Display Name
  const orderAddress = order?.shippingAddress;
  const customerName =
    orderAddress?.fullName ||
    fallbackRecipientName ||
    [accountUser?.firstName, accountUser?.lastName].filter(Boolean).join(" ") ||
    "Customer";

  // Identifiers & Status
  const orderNumber =
    (order?.orderNumber as string | undefined) ||
    (order?._id as string | undefined) ||
    order?.id ||
    effectiveOrderId ||
    "";
  const orderStatus = (order?.status as string | undefined) || "Confirmed";
  const paymentStatus =
    (order?.paymentStatus as string | undefined) ||
    ((order?.payment as { status?: string } | undefined)?.status) ||
    (order?.paymentMethod === "COD" ? "PENDING" : "PAID");
  const paymentMethod =
    (order?.paymentMethod as string | undefined) ||
    fallbackPaymentMethod ||
    "ONLINE";
  const orderDate = (order?.date as string | undefined) || (order?.createdAt as string | undefined);

  // Calculations
  const items = (order?.items || []) as Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    mrp?: number;
    category?: string;
  }>;

  const itemsSubtotal = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  const totalAmount =
    order?.totalAmount !== undefined && order?.totalAmount !== null
      ? Number(order.totalAmount)
      : fallbackTotal !== undefined && fallbackTotal !== null
      ? fallbackTotal
      : itemsSubtotal;

  const shippingFee =
    order?.shippingFee !== undefined && order?.shippingFee !== null
      ? Number(order.shippingFee)
      : 0;

  const discountAmount = Math.max(0, itemsSubtotal + shippingFee - totalAmount);
  const couponCode =
    (order?.couponCode as string | undefined) ||
    ((order?.coupon as { code?: string } | undefined)?.code) ||
    null;

  // Safe payment metadata
  const paymentObj = order?.payment as
    | {
        gatewayPaymentId?: string;
        gatewayOrderId?: string;
        transactionRef?: string;
      }
    | undefined;

  const transactionRef =
    paymentObj?.gatewayPaymentId ||
    paymentObj?.transactionRef ||
    (paymentMethod === "COD" ? null : null);

  // Fulfillment & Tracking details
  const fulfillmentObj = order?.fulfillment as
    | {
        courierName?: string | null;
        trackingCode?: string | null;
        etd?: string | null;
      }
    | undefined;

  const courierName = fulfillmentObj?.courierName || null;
  const trackingCode = fulfillmentObj?.trackingCode || (order?.trackingNumber as string | null) || null;
  const estimatedDelivery = fulfillmentObj?.etd || null;

  // Invoice Download Handler
  const handleDownloadInvoice = async () => {
    if (!order?.id) return;
    try {
      setDownloadingInvoice(true);
      setInvoiceErrorMessage(null);
      const res = await orderService.downloadInvoice(order.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const downloadName = `Invoice-${orderNumber || order.id}.pdf`;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastInvoiceNumber(orderNumber || order.id);
      setShowToast(true);
    } catch {
      setInvoiceErrorMessage("Tax invoice will be available for download once order is dispatched, or please check your order history.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-10 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* Ambient subtle background depth glows matching Stitch */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-secondary-container/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary-fixed/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-4xl mx-auto flex flex-col gap-8 md:gap-10">
        {/* 1. Celebratory Confirmation Header Card */}
        <OrderConfirmationHero
          customerName={customerName}
          orderNumber={orderNumber}
          orderStatus={orderStatus}
          paymentMethod={paymentMethod}
          paymentStatus={paymentStatus}
          orderDate={orderDate}
          totalAmount={totalAmount}
        />

        {/* 2. Two-Column Order Details: Delivery Address & Payment Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeliveryAddressCard
            address={orderAddress}
            shippingMethod="Standard Delivery"
          />

          <PaymentSummaryCard
            totalAmount={totalAmount}
            paymentMethod={paymentMethod}
            paymentStatus={paymentStatus}
            orderStatus={orderStatus}
            transactionRef={transactionRef}
            onDownloadInvoice={order?.id ? handleDownloadInvoice : undefined}
            isDownloadingInvoice={downloadingInvoice}
          />
        </section>


        {invoiceErrorMessage && (
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 text-xs text-on-surface-variant flex items-center justify-between">
            <span>{invoiceErrorMessage}</span>
            <button
              type="button"
              onClick={() => setInvoiceErrorMessage(null)}
              className="text-primary font-medium hover:underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3. Optional Shipment / Tracking Card */}
        {(courierName || trackingCode || estimatedDelivery) && (
          <ShipmentInfoCard
            courierName={courierName}
            trackingCode={trackingCode}
            estimatedDelivery={estimatedDelivery}
            orderStatus={orderStatus}
            onTrack={trackingCode && order?.id ? () => setShowTracking(true) : undefined}
          />
        )}

        {/* 4. Items in This Shipment & Financial Ledger Card */}
        <OrderItemsCard
          items={items}
          itemsSubtotal={itemsSubtotal}
          discountAmount={discountAmount}
          couponCode={couponCode}
          shippingFee={shippingFee}
          totalAmount={totalAmount}
        />
      </div>

      {/* Floating Invoice Download Toast */}
      <InvoiceToast
        invoiceNumber={toastInvoiceNumber || orderNumber || "KF-ORDER"}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Live Order Tracking Modal */}
      {showTracking && order?.id && (
        <OrderTrackingModal
          orderId={order.id}
          orderNumber={orderNumber}
          onClose={() => setShowTracking(false)}
        />
      )}
    </div>
  );
}
