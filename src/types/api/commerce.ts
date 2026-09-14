import type { Address, Cart, CartItem, EntityId, Order, Payment, Wishlist } from "../entities";
import type { ApiErrorDto, ApiResponseDto, DeleteResponseData, EmptyRequestDto, IdPathRequestDto } from "./common";

export type GetCartRequestDto = EmptyRequestDto;
export type GetCartResponseDto = ApiResponseDto<Cart>;
export type GetCartErrorDto = ApiErrorDto;
export type AddCartItemRequestDto = CartItem;
export type AddCartItemResponseDto = ApiResponseDto<Cart>;
export type AddCartItemErrorDto = ApiErrorDto;
export interface UpdateCartItemRequestDto { item: Pick<CartItem, "id" | "size" | "color">; quantity: number; }
export type UpdateCartItemResponseDto = ApiResponseDto<Cart>;
export type UpdateCartItemErrorDto = ApiErrorDto;
export type RemoveCartItemRequestDto = Pick<CartItem, "id" | "size" | "color">;
export type RemoveCartItemResponseDto = ApiResponseDto<Cart>;
export type RemoveCartItemErrorDto = ApiErrorDto;

export interface CheckoutRequestDto {
  items: CartItem[];
  shippingAddressId?: string;
  shippingAddress: Omit<Address, "id" | "isDefault">;
  paymentMethod: string;
  couponCode?: string;
  idempotencyKey?: string;
}
export type CheckoutResponseDto = ApiResponseDto<{ order: Order; payment?: Payment }>;
export type CheckoutErrorDto = ApiErrorDto;

export type GetOrdersRequestDto = EmptyRequestDto;
export type GetOrdersResponseDto = ApiResponseDto<Order[]>;
export type GetOrdersErrorDto = ApiErrorDto;
export type GetOrderRequestDto = IdPathRequestDto;
export type GetOrderResponseDto = ApiResponseDto<Order>;
export type GetOrderErrorDto = ApiErrorDto;
export type CreateOrderRequestDto = Omit<Order, "id" | "date" | "status">;
export type CreateOrderResponseDto = ApiResponseDto<Order>;
export type CreateOrderErrorDto = ApiErrorDto;

export type GetWishlistRequestDto = EmptyRequestDto;
export type GetWishlistResponseDto = ApiResponseDto<Wishlist>;
export type GetWishlistErrorDto = ApiErrorDto;
export interface ToggleWishlistRequestDto { productId: EntityId; }
export type ToggleWishlistResponseDto = ApiResponseDto<Wishlist>;
export type ToggleWishlistErrorDto = ApiErrorDto;

export type GetAddressesRequestDto = EmptyRequestDto;
export type GetAddressesResponseDto = ApiResponseDto<Address[]>;
export type GetAddressesErrorDto = ApiErrorDto;
export type CreateAddressRequestDto = Omit<Address, "id">;
export type CreateAddressResponseDto = ApiResponseDto<Address>;
export type CreateAddressErrorDto = ApiErrorDto;
export interface UpdateAddressRequestDto { id: EntityId; data: Partial<Omit<Address, "id">>; }
export type UpdateAddressResponseDto = ApiResponseDto<Address>;
export type UpdateAddressErrorDto = ApiErrorDto;
export type DeleteAddressRequestDto = IdPathRequestDto;
export type DeleteAddressResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteAddressErrorDto = ApiErrorDto;
