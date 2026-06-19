# KamiraFit centralized mock API migration

## Implementation result

All asynchronous mock behavior now enters through `src/api/mockApi.ts`. Services unwrap the same discriminated response type, and all simulated network latency is owned by `src/api/mock/latency.ts`.

The active dependency direction is:

```text
Component / server page
  -> React Query hook (or service for server components)
  -> domain service
  -> mockApi
  -> fixture data + in-memory mock state
```

Redux remains the immediate UI cache for the existing cart and wishlist controls. `CommerceStateSync` mirrors those changes through React Query service mutations into `mockApi`, preserving the current instant interactions while establishing the backend seam.

## Central infrastructure

- `src/api/mockApi.ts`: typed domain client for products, categories, auth, cart, checkout, orders, wishlist, addresses, reviews, and admin operations.
- `src/api/mock/response.ts`: unified `{ success: true, data } | { success: false, error }` response, typed mock error, and service unwrapping helper.
- `src/api/mock/latency.ts`: the only network-delay implementation. The default is 400 ms and can be changed with `NEXT_PUBLIC_MOCK_API_DELAY_MS`.
- `src/api/mock/data/storefrontCategories.ts`: storefront category fixture moved out of the home component.

## Services migrated

- `product.ts`: list, featured, detail, related, create, update, and delete.
- `category.ts`: storefront category list.
- `auth.ts` and `features/auth/services/auth.service.ts`: customer/admin login, registration, refresh, logout, profile read/update.
- `cart.ts`: cart read/update and React Query hooks.
- `checkout.ts`: checkout placement and cache invalidation.
- `order.ts`: customer order list/create.
- `wishlist.ts`: list/toggle/update.
- `address.ts`: address CRUD.
- `review.ts`: product review list/create.
- `admin.ts`: stats and category/product/user/order operations.

## UI and state changes

- Checkout now calls `useCheckout`; its component-level fake network timeout was removed.
- The admin dashboard now reads React Query service data instead of fixture-seeded Redux state.
- Home categories now come from `categoryService` instead of an inline component array.
- Account logout now executes the auth service before clearing local UI state.
- Legacy admin Redux slices start empty instead of importing mock fixtures. Current admin screens use service hooks.
- `CommerceStateSync` bridges existing Redux cart/wishlist interactions into their centralized services without changing UX.

## Fixture ownership

Existing product, account, admin category, admin user, and admin order fixture files remain passive data sources. Only `mockApi.ts` imports their runtime values. UI files may import canonical entity types and enum-like constants, but do not import mock records.

## Replacing mockApi with a real backend

1. Implement a `realApi` object with the same domain method names and return `MockApiResponse<T>`-compatible results, or introduce a transport-neutral `ApiClient` interface and have both clients implement it.
2. Select the client in one module (for example, `api/index.ts`) using an environment flag. Services should continue importing only the selected client and `unwrap` helper.
3. Replace in-memory mutation logic with Axios calls using the DTOs in `src/types/api/`.
4. Remove `simulateNetworkLatency` from the selected production path; do not alter hooks or components.
5. Hydrate cart and wishlist from backend responses after authentication, then retire `CommerceStateSync` and the corresponding Redux slices once React Query becomes authoritative.
6. Add request cancellation, retry policy, authorization refresh, and server-safe cookie handling at the transport boundary.

## Remaining technical debt

- Cart and wishlist still use Redux as the immediate UI source and are mirrored to the API seam. A backend migration should make React Query/backend state authoritative.
- Mock state is module-local. Server and browser bundles can hold separate instances, and a refresh resets mutations.
- The two auth service facades should eventually be consolidated.
- IDs and timestamps are generated client-side for mocks only.
- Checkout uses a placeholder payment method and an empty shipping state because the current form does not collect state.
- No persistence, stock reservation, concurrent mutation control, idempotency, or payment gateway lifecycle exists yet.

## Verification

The migration is validated with strict TypeScript compilation, ESLint, a scan confirming the sole simulated-network timeout is in `src/api/mock/latency.ts`, and a scan confirming services no longer import fixtures directly.
