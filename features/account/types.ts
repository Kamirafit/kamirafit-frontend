export type AddressType = "Home" | "Work" | "Other";

export type Address = {
  id: string;
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "Other" | "";
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "In Transit"
  | "Delivered"
  | "Return Requested"
  | "Return Approved"
  | "Return In Progress"
  | "Return Completed"
  | "Refund Initiated"
  | "Refund Completed"
  | "Cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
};

export type Review = {
  id: string;
  orderId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  date: string;
  customerName: string;
};
