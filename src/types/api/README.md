# KamiraFit API contract registry

This directory is the backend hand-off boundary. Entity payloads live in `../entities`; every endpoint below has a request, success response, and error DTO. Responses use `{ success: true, data, message? }`; errors use `{ success: false, code, message, details?, requestId? }`.

## Storefront catalog

| Method and path | Request DTO | Response DTO | Error DTO |
|---|---|---|---|
| `GET /products` | `GetProductsRequestDto` | `GetProductsResponseDto` | `GetProductsErrorDto` |
| `GET /products/:id` | `GetProductRequestDto` | `GetProductResponseDto` | `GetProductErrorDto` |
| `GET /products/:id/related` | `GetRelatedProductsRequestDto` | `GetRelatedProductsResponseDto` | `GetRelatedProductsErrorDto` |
| `GET /categories` | `GetCategoriesRequestDto` | `GetCategoriesResponseDto` | `GetCategoriesErrorDto` |
| `POST /products` | `CreateProductRequestDto` | `CreateProductResponseDto` | `CreateProductErrorDto` |
| `PATCH /products/:id` | `UpdateProductRequestDto` | `UpdateProductResponseDto` | `UpdateProductErrorDto` |
| `DELETE /products/:id` | `DeleteProductRequestDto` | `DeleteProductResponseDto` | `DeleteProductErrorDto` |

## Authentication and profile

| Method and path | Request DTO | Response DTO | Error DTO |
|---|---|---|---|
| `POST /auth/login` | `LoginRequestDto` | `LoginResponseDto` | `LoginErrorDto` |
| `POST /auth/register` | `RegisterRequestDto` | `RegisterResponseDto` | `RegisterErrorDto` |
| `POST /auth/refresh` | `RefreshSessionRequestDto` | `RefreshSessionResponseDto` | `RefreshSessionErrorDto` |
| `POST /auth/logout` | `LogoutRequestDto` | `LogoutResponseDto` | `LogoutErrorDto` |
| `GET /profile` | `GetProfileRequestDto` | `GetProfileResponseDto` | `GetProfileErrorDto` |
| `PATCH /profile` | `UpdateProfileRequestDto` | `UpdateProfileResponseDto` | `UpdateProfileErrorDto` |

## Cart, checkout, orders, wishlist, and addresses

| Method and path | Request DTO | Response DTO | Error DTO |
|---|---|---|---|
| `GET /cart` | `GetCartRequestDto` | `GetCartResponseDto` | `GetCartErrorDto` |
| `POST /cart/items` | `AddCartItemRequestDto` | `AddCartItemResponseDto` | `AddCartItemErrorDto` |
| `PATCH /cart/items` | `UpdateCartItemRequestDto` | `UpdateCartItemResponseDto` | `UpdateCartItemErrorDto` |
| `DELETE /cart/items` | `RemoveCartItemRequestDto` | `RemoveCartItemResponseDto` | `RemoveCartItemErrorDto` |
| `POST /checkout` | `CheckoutRequestDto` | `CheckoutResponseDto` | `CheckoutErrorDto` |
| `GET /orders` | `GetOrdersRequestDto` | `GetOrdersResponseDto` | `GetOrdersErrorDto` |
| `GET /orders/:id` | `GetOrderRequestDto` | `GetOrderResponseDto` | `GetOrderErrorDto` |
| `POST /orders` | `CreateOrderRequestDto` | `CreateOrderResponseDto` | `CreateOrderErrorDto` |
| `GET /wishlist` | `GetWishlistRequestDto` | `GetWishlistResponseDto` | `GetWishlistErrorDto` |
| `POST /wishlist/toggle` | `ToggleWishlistRequestDto` | `ToggleWishlistResponseDto` | `ToggleWishlistErrorDto` |
| `GET /addresses` | `GetAddressesRequestDto` | `GetAddressesResponseDto` | `GetAddressesErrorDto` |
| `POST /addresses` | `CreateAddressRequestDto` | `CreateAddressResponseDto` | `CreateAddressErrorDto` |
| `PATCH /addresses/:id` | `UpdateAddressRequestDto` | `UpdateAddressResponseDto` | `UpdateAddressErrorDto` |
| `DELETE /addresses/:id` | `DeleteAddressRequestDto` | `DeleteAddressResponseDto` | `DeleteAddressErrorDto` |

## Reviews

| Method and path | Request DTO | Response DTO | Error DTO |
|---|---|---|---|
| `GET /products/:productId/reviews` | `GetReviewsRequestDto` | `GetReviewsResponseDto` | `GetReviewsErrorDto` |
| `POST /products/:productId/reviews` | `CreateReviewRequestDto` | `CreateReviewResponseDto` | `CreateReviewErrorDto` |

## Admin

Admin DTOs in `admin.ts` cover stats plus list/create/update/delete operations currently exposed by the admin services for categories, products, users, and orders. Each operation follows the same `GetAdmin…RequestDto`, `…ResponseDto`, and `…ErrorDto` naming scheme. Product status toggle has dedicated DTOs.

## Contract decisions

- Money remains a `number` in major currency units to preserve the UI. A backend should either keep this convention or introduce a versioned migration to integer minor units.
- Optional properties represent values the current UI genuinely omits. No contract field uses `any`; untrusted transport failures enter as `unknown` and are narrowed.
- `Order` is the customer account projection. `AdminOrder` is intentionally separate because the existing admin table uses customer summary, totals, and payment status fields that the account view does not.
- `CartItem.id` is the product id for Redux compatibility. Renaming it to `productId` would be a versioned breaking contract.
