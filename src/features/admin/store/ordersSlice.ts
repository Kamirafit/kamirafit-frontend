import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AdminOrder as Order,
  AdminOrderItem as OrderItem,
  AdminOrderStatus as OrderStatus,
  OrderCustomer,
  PaymentStatus,
} from "@/types/entities";

type State = {
  items: Order[];
};

const initialState: State = {
  items: [],
};

const DELIVERY_FEE = 79;

function recomputeTotals(order: Order) {
  order.subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
  order.total = order.subtotal + order.deliveryFee;
}

export type OrderPatch = {
  customer?: Partial<OrderCustomer>;
  items?: OrderItem[];
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  deliveryFee?: number;
};

const ordersSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    updateOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>,
    ) {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) order.orderStatus = action.payload.status;
    },
    updatePaymentStatus(
      state,
      action: PayloadAction<{ id: string; status: PaymentStatus }>,
    ) {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) order.paymentStatus = action.payload.status;
    },
    /**
     * Apply a partial edit to a single order. Totals are recomputed whenever
     * items or deliveryFee change so the displayed total is always derived.
     */
    updateOrder(
      state,
      action: PayloadAction<{ id: string; patch: OrderPatch }>,
    ) {
      const { id, patch } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (!order) return;
      if (patch.customer) order.customer = { ...order.customer, ...patch.customer };
      if (patch.items) order.items = patch.items;
      if (patch.paymentStatus) order.paymentStatus = patch.paymentStatus;
      if (patch.orderStatus) order.orderStatus = patch.orderStatus;
      if (typeof patch.deliveryFee === "number")
        order.deliveryFee = patch.deliveryFee;
      if (patch.items || typeof patch.deliveryFee === "number") {
        recomputeTotals(order);
      }
    },
    deleteOrder(state, action: PayloadAction<string>) {
      state.items = state.items.filter((o) => o.id !== action.payload);
    },
  },
});

export const DEFAULT_DELIVERY_FEE = DELIVERY_FEE;

export const {
  updateOrderStatus,
  updatePaymentStatus,
  updateOrder,
  deleteOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;
