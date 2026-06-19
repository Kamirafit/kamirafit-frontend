# KamiraFit frontend entity and API contract audit

## Result

The frontend now has one strict entity layer at `src/types/entities/index.ts` and endpoint DTOs at `src/types/api/`. Existing feature imports remain compatible through re-exports, services still return their mock payloads, and no backend/runtime API implementation was introduced.

## Created interfaces and reusable types

Core entities: `Product`, `Category`, `Cart`, `CartItem`, `Wishlist`, `User`, `Profile`, `Address`, `Order`, `OrderItem`, `Payment`, `Review`, `AuthSession`, `AdminUser`, `AdminCategory`, `AdminOrder`, `AdminOrderItem`, and `OrderCustomer`.

Shared primitives and enum-like JSON-safe sets: entity/date identifiers, currency, product sizes/colors/statuses, category names/slugs, address types, genders, user roles, customer/admin order statuses, payment statuses, and payment methods.

## Created DTOs

- Common: success envelope, structured error, field error, pagination, id path, empty request/response, and delete response.
- Catalog: product list/detail/related/create/update/delete and category list.
- Auth/profile: login, register, refresh, logout, get profile, and update profile.
- Commerce: cart read/add/update/remove, checkout, order list/detail/create, wishlist read/toggle, and address CRUD.
- Reviews: list and create.
- Admin: stats and the current category/product/user/order read and mutation operations.

The complete endpoint-to-DTO matrix is in `src/types/api/README.md`.

## Gaps found in the current frontend

- Cart and checkout are Redux/UI-only; there is no service module consuming the new cart or checkout contracts yet.
- No real token/cookie persistence, payment provider, inventory reservation, shipping quote, tax, coupon, or refund service exists.
- Two auth service facades exist (`src/services/auth.ts` and `src/features/auth/services/auth.service.ts`). Both now consume shared contracts, but backend integration should converge on one facade.
- Customer and admin order mocks expose different projections. They are modeled explicitly rather than hidden behind casts.
- Product price is currently a major-unit `number`; precision and currency policy must be agreed before backend storage is frozen.

## Potential future contracts

- Inventory/variant availability, SKU, stock reservation, and backorder policy.
- Payment intent creation, gateway webhook events, payment verification, refunds, and idempotency keys.
- Shipping methods, rate quotes, serviceability by pincode, tracking events, tax/GST invoices, and returns/RMA.
- Coupons, promotions, gift cards, store credit, and loyalty balances.
- Email/phone verification, password reset, MFA, session listing/revocation, and admin permissions.
- Search suggestions, facets, cursor pagination, recently viewed products, recommendations, and analytics ingestion.
- Media upload/presigned URL, review moderation, abuse reports, notifications, and newsletter preferences.
