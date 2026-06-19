/**
 * Orders domain shared by admin + (future) storefront surfaces.
 *
 * Shape mirrors what the cart/checkout flow already produces (id, line items
 * with size/color/qty/price, customer contact, totals) so that a real backend
 * can later replace `ORDERS` with a fetched payload without changing the UI.
 */

import type {
  AdminOrder,
  AdminOrderItem,
  OrderCustomer,
  AdminOrderStatus,
  PaymentStatus,
} from "@/types/entities";
export { PAYMENT_STATUSES, ADMIN_ORDER_STATUSES as ORDER_STATUSES } from "@/types/entities";
export type { PaymentStatus, AdminOrderStatus as OrderStatus, OrderCustomer } from "@/types/entities";

export type OrderItem = AdminOrderItem;
export type Order = AdminOrder;

const DELIVERY_FEE = 79;

function makeOrder(
  id: string,
  customer: OrderCustomer,
  items: OrderItem[],
  paymentStatus: PaymentStatus,
  orderStatus: AdminOrderStatus,
  createdAt: string,
): Order {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  return {
    id,
    customer,
    items,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total: subtotal + DELIVERY_FEE,
    paymentStatus,
    orderStatus,
    createdAt,
  };
}

export const ORDERS: Order[] = [
  makeOrder(
    "ORD-1042",
    {
      name: "Ananya Sharma",
      phone: "+91 98200 12345",
      address: "B-402, Ivory Towers, Bandra West, Mumbai 400050",
    },
    [
      {
        productId: "p-01",
        name: "Ivory Oversized Tee",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "White",
        quantity: 2,
        price: 799,
      },
      {
        productId: "p-04",
        name: "Sand Regular Fit Tee",
        image:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=400&q=80",
        size: "L",
        color: "White",
        quantity: 1,
        price: 649,
      },
    ],
    "Paid",
    "Delivered",
    "2026-04-14",
  ),
  makeOrder(
    "ORD-1041",
    {
      name: "Rohan Kapoor",
      phone: "+91 98765 43210",
      address: "14, Hauz Khas Enclave, New Delhi 110016",
    },
    [
      {
        productId: "p-02",
        name: "Midnight Relaxed Hoodie",
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80",
        size: "L",
        color: "Black",
        quantity: 1,
        price: 1799,
      },
    ],
    "Paid",
    "In Transit",
    "2026-04-16",
  ),
  makeOrder(
    "ORD-1040",
    {
      name: "Meera Iyer",
      phone: "+91 90876 55214",
      address: "7, Indiranagar 1st Stage, Bengaluru 560038",
    },
    [
      {
        productId: "p-06",
        name: "Crimson Panel Hoodie",
        image:
          "https://images.unsplash.com/photo-1618354691249-18772bbac3c5?auto=format&fit=crop&w=400&q=80",
        size: "S",
        color: "Red",
        quantity: 1,
        price: 1999,
      },
      {
        productId: "p-11",
        name: "Ash Oversized Long Tee",
        image:
          "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Black",
        quantity: 1,
        price: 999,
      },
    ],
    "Pending",
    "Confirmed",
    "2026-04-17",
  ),
  makeOrder(
    "ORD-1039",
    {
      name: "Karan Mehta",
      phone: "+91 94110 88765",
      address: "B-22, Sector 45, Noida 201303",
    },
    [
      {
        productId: "p-09",
        name: "Porcelain Zip Hoodie",
        image:
          "https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "White",
        quantity: 1,
        price: 1899,
      },
    ],
    "Paid",
    "Return Requested",
    "2026-04-10",
  ),
  makeOrder(
    "ORD-1038",
    {
      name: "Sneha Pillai",
      phone: "+91 99873 21456",
      address: "Flat 3A, Palm Grove, Kochi 682020",
    },
    [
      {
        productId: "p-12",
        name: "Carbon Pullover Hoodie",
        image:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80",
        size: "L",
        color: "Black",
        quantity: 2,
        price: 1599,
      },
    ],
    "Paid",
    "Refund Initiated",
    "2026-04-08",
  ),
  makeOrder(
    "ORD-1037",
    {
      name: "Aditya Verma",
      phone: "+91 99001 22334",
      address: "C-9, Salt Lake Sector V, Kolkata 700091",
    },
    [
      {
        productId: "p-07",
        name: "Noir Boxy Tee",
        image:
          "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Black",
        quantity: 3,
        price: 749,
      },
    ],
    "Failed",
    "Cancelled",
    "2026-04-05",
  ),
  makeOrder(
    "ORD-1036",
    {
      name: "Priya Nair",
      phone: "+91 98112 33445",
      address: "12, Anna Nagar East, Chennai 600102",
    },
    [
      {
        productId: "p-14",
        name: "Azure Oversized Tee",
        image:
          "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=400&q=80",
        size: "S",
        color: "Blue",
        quantity: 1,
        price: 899,
      },
      {
        productId: "p-13",
        name: "Snow Regular Crewneck",
        image:
          "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "White",
        quantity: 1,
        price: 1199,
      },
    ],
    "Paid",
    "Pending",
    "2026-04-18",
  ),
  makeOrder(
    "ORD-1035",
    {
      name: "Vikram Rao",
      phone: "+91 97456 11228",
      address: "Villa 17, Jubilee Hills, Hyderabad 500033",
    },
    [
      {
        productId: "p-03",
        name: "Stone Everyday Crewneck",
        image:
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80",
        size: "L",
        color: "Black",
        quantity: 2,
        price: 1299,
      },
    ],
    "Paid",
    "Return In Progress",
    "2026-04-02",
  ),
  makeOrder(
    "ORD-1034",
    {
      name: "Ishita Banerjee",
      phone: "+91 90023 77881",
      address: "Apt 6C, Golden Heights, Pune 411014",
    },
    [
      {
        productId: "p-05",
        name: "Cobalt Oversized Tee",
        image:
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80",
        size: "M",
        color: "Blue",
        quantity: 1,
        price: 899,
      },
    ],
    "Paid",
    "Return Completed",
    "2026-03-30",
  ),
  makeOrder(
    "ORD-1033",
    {
      name: "Neel Joshi",
      phone: "+91 93300 65432",
      address: "Shop 4, Law Garden, Ahmedabad 380006",
    },
    [
      {
        productId: "p-08",
        name: "Signal Red Regular Tee",
        image:
          "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=400&q=80",
        size: "XL",
        color: "Red",
        quantity: 2,
        price: 699,
      },
    ],
    "Paid",
    "Refund Completed",
    "2026-03-24",
  ),
];
