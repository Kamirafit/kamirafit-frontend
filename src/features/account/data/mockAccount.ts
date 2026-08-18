import { Address, Order, Profile } from "../types";

export const MOCK_PROFILE: Profile = {
  id: "51f7cb88-b17f-4e08-b2e8-818557da01d9",
  firstName: "Krishnendu",
  lastName: "Ganguly",
  email: "krishnendug88@gmail.com",
  countryCode: "+91",
  phoneNumber: "9163461252",
  mobileNumber: "+91 9163461252",
  gender: "male",
  role: "CUSTOMER",
};

export const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    type: "Home",
    fullName: "Ayesha Sharma",
    phoneNumber: "+91 9876543210",
    addressLine1: "Flat 4B, Silver Oaks Apartment",
    addressLine2: "Off Linking Road",
    landmark: "Behind Cafe Coffee Day",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Work",
    fullName: "Ayesha Sharma",
    phoneNumber: "+91 9876543210",
    addressLine1: "Tower 2, WeWork Tech Park",
    addressLine2: "Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    isDefault: false,
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-KF-98231",
    date: "2023-10-15T10:30:00Z",
    status: "Delivered",
    totalAmount: 3499,
    shippingAddress: MOCK_ADDRESSES[0],
    paymentMethod: "Credit Card (Visa ending in 4242)",
    trackingNumber: "BDP-8839201029",
    items: [
      {
        productId: "p-1",
        productName: "Silk Blend Flared Kurti",
        productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        size: "M",
        color: "Wine",
        price: 3499
      }
    ]
  },
  {
    id: "ORD-KF-98255",
    date: "2023-11-02T14:45:00Z",
    status: "Processing",
    totalAmount: 5298,
    shippingAddress: MOCK_ADDRESSES[1],
    paymentMethod: "UPI",
    items: [
      {
        productId: "p-2",
        productName: "Linen Co-ord Set",
        productImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        size: "M",
        color: "Cream",
        price: 2799
      },
      {
        productId: "p-3",
        productName: "Oversized Cotton Tee",
        productImage: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        size: "L",
        color: "Charcoal",
        price: 2499
      }
    ]
  }
];
