import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  ORDERS,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/data/orders";

type State = {
  items: Order[];
};

const initialState: State = {
  items: ORDERS,
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
  },
});

export const { updateOrderStatus, updatePaymentStatus } = ordersSlice.actions;

export default ordersSlice.reducer;
