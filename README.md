# KamiraFit Frontend

Welcome to the frontend application for **KamiraFit**, a modern, high-performance apparel and lifestyle ecommerce platform built with Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, and TanStack React Query.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Exhaustive Folder & Directory Breakdown](#3-exhaustive-folder--directory-breakdown)
4. [Startup & Local Development Guide](#4-startup--local-development-guide)
5. [State Management & Data Flow](#5-state-management--data-flow)
6. [Validation & API Contracts](#6-validation--api-contracts)
7. [Core User Journeys & Features](#7-core-user-journeys--features)
8. [Application Routes (Storefront & Admin)](#8-application-routes-storefront--admin)
9. [Deployment Guide (Vercel & Production)](#9-deployment-guide-vercel--production)

---

## 1. Architecture Overview

The KamiraFit frontend is organized around a **Feature-Driven, Domain-Centric Architecture**. By decoupling domain modules into isolated features while centralizing global UI primitives, API clients, and schemas, the application scales effortlessly as catalog complexity and traffic grow.

### High-Level System Flow

```mermaid
graph TD
    User[Customer / Admin Browser] -->|Routes & Pages| AppRouter[Next.js 15 App Router (src/app/*)]
    
    subgraph View & Components Layer
        AppRouter --> Layouts[Layouts & Providers (QueryProvider, Redux Provider)]
        AppRouter --> FeatureComponents[Feature Components (src/features/*)]
        AppRouter --> UIPrimitives[Shared UI Components (src/components/ui/*)]
    end

    subgraph State Management
        FeatureComponents --> ReduxStore[Redux Toolkit (Client UI State: Cart, Modals, Session)]
        FeatureComponents --> ReactQuery[TanStack React Query (Server Cache, Mutations)]
    end

    subgraph Validation & Data Access
        ReactQuery --> ServiceLayer[Service Layer (src/services/*)]
        ServiceLayer --> ZodSchemas[Runtime Zod Validation (src/schemas/*)]
        ServiceLayer --> ApiClient[Axios Client / Mock API Switcher (src/api/*)]
    end

    subgraph External Systems
        ApiClient -->|REST JSON + JWT| BackendAPI[KamiraFit Express Backend]
        FeatureComponents -->|Phone Verification| FirebaseClient[Firebase Auth SDK]
    end
```

### Architectural Principles

1. **Feature Slicing (`src/features`)**: Code is grouped by business domain (`product`, `cart`, `account`, `auth`, `admin`) rather than technical type alone. Each feature encapsulates its own sub-components, custom hooks, Redux slice, and specialized services.
2. **Dual-Layer State Strategy**:
   - **Client State (Redux Toolkit)**: Manages synchronous, interactive client UI state: shopping bag drawer visibility, cart quantity modifications, active filter drawer selections, and cached guest user preferences.
   - **Server State (TanStack React Query)**: Handles all server data caching, background revalidation, optimistic mutations, pagination, and request deduplication.
3. **Strict Runtime Schema Validation (Zod)**: Prevents unexpected runtime UI crashes by running incoming API responses and user form submissions through strongly-typed Zod schemas (`src/schemas/*`).
4. **Contract-First Networking (`src/types/api`)**: All request payloads, response envelopes, and error DTOs are predefined, allowing frontend development to proceed seamlessly against both real backend services and mock test fixtures.
5. **Fail-Safe UI States**: Dedicated async state wrappers (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineState`, `RouteErrorState`) present polished fallback graphics, retry buttons, and helpful recovery instructions on every view.

---

## 2. Tech Stack

- **Framework**: Next.js 15.5+ (App Router, Turbopack, Server & Client Components)
- **UI Library**: React 19 & React DOM 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS custom properties
- **Client State Management**: Redux Toolkit (`@reduxjs/toolkit`) & `react-redux`
- **Server Cache & Async Management**: TanStack React Query v5 (`@tanstack/react-query`)
- **Runtime Validation**: Zod (v4.x)
- **HTTP Client**: Axios (v1.20+) with request/response interceptors
- **Authentication**: Firebase Client SDK (Phone OTP Verification) + Express JWT Session Handling
- **Build & Bundler**: Turbopack (`next dev --turbopack`, `next build --turbopack`)

---

## 3. Exhaustive Folder & Directory Breakdown

```
kamirafit/
├── src/
│   ├── api/                             # Network communication & mock infrastructure
│   │   ├── client.ts                    # Central Axios instance with auth interceptors & base URL config
│   │   ├── mockApi.ts                   # Centralized mock API router simulating backend responses
│   │   └── mock/                        # Mock testing utilities & initial payloads
│   │       ├── latency.ts               # Artificial network delay simulator
│   │       ├── response.ts              # Mock success and error response generator
│   │       └── data/                    # Local fixture datasets (e.g. storefrontCategories.ts)
│   ├── app/                             # Next.js App Router (pages, layouts, route handlers)
│   │   ├── layout.tsx                   # Root HTML layout wrapping QueryProvider, Redux, Navbar, and Footer
│   │   ├── page.tsx                     # Storefront homepage with hero banner, category pills, featured drops
│   │   ├── globals.css                  # Global Tailwind CSS v4 imports, typography, and root color variables
│   │   ├── account/                     # Customer account dashboard routes
│   │   │   ├── page.tsx                 # Account overview and quick stats
│   │   │   ├── addresses/page.tsx       # Address book management (add, edit, set default shipping/billing)
│   │   │   ├── orders/page.tsx          # Order history, live status badges, AWB tracking, invoice download
│   │   │   ├── pan/page.tsx             # Tax and PAN compliance details for high-value purchases
│   │   │   └── profile/page.tsx         # Personal details editor (name, phone, email, gender)
│   │   ├── cart/page.tsx                # Dedicated shopping cart page with order summary & savings counter
│   │   ├── checkout/page.tsx            # Multi-step checkout (address selection, payment mode, coupon box)
│   │   ├── contact/                     # Customer contact inquiry page
│   │   │   ├── page.tsx                 # Server page wrapper
│   │   │   └── ContactClient.tsx        # Interactive contact form client component
│   │   ├── cookies/page.tsx             # Cookie consent & policy information
│   │   ├── dedicated-admin/             # Protected administrative portal
│   │   │   ├── layout.tsx               # Admin layout with dedicated sidebar navigation and admin topbar
│   │   │   ├── page.tsx                 # Primary admin dashboard showing sales summaries and alerts
│   │   │   ├── analytics/page.tsx       # Revenue metrics, daily order volumes, conversion indicators
│   │   │   ├── categories/page.tsx      # Category tree management (parent/child hierarchy & slugs)
│   │   │   ├── coupons/page.tsx         # Promo coupon creation, discount rules, active coupon list
│   │   │   ├── login/page.tsx           # Dedicated admin credentials login screen
│   │   │   ├── orders/page.tsx          # Order management, fulfillment drawer, tracking AWB assignment
│   │   │   ├── products/page.tsx        # Product catalog list, inventory management, product form modal
│   │   │   ├── queries/page.tsx         # Inbound customer contact messages and resolution status
│   │   │   ├── testimonials/page.tsx    # Customer quote review and testimonial publishing controls
│   │   │   └── users/page.tsx           # Customer directory view
│   │   ├── login/page.tsx               # Customer login and phone OTP authentication dialog
│   │   ├── privacy/page.tsx             # Privacy Policy dynamic page
│   │   ├── product/                     # Product catalog routing
│   │   │   └── [id]/page.tsx            # Dynamic product detail page with variant selection & reviews
│   │   ├── returns/page.tsx             # Return & Exchange policy documentation
│   │   ├── shipping/page.tsx            # Shipping terms, delivery timelines, and courier partner details
│   │   ├── shop/page.tsx                # Catalog browsing page with price, category, size, and sort filters
│   │   ├── size-guide/page.tsx          # Apparel sizing charts for Oversized, Regular, and Hoodies
│   │   ├── terms/page.tsx               # Terms and conditions page
│   │   └── wishlist/page.tsx            # Customer wishlist gallery with 1-click add-to-cart
│   ├── components/                      # Reusable UI component modules
│   │   ├── admin/                       # Admin UI components
│   │   │   ├── AdminHeader.tsx          # Admin topbar with notifications and profile dropdown
│   │   │   ├── AdminSidebar.tsx         # Sidebar navigation links for admin sections
│   │   │   └── orders/                  # Order management subcomponents (e.g. FulfillModal.tsx)
│   │   ├── cart/                        # Cart UI components (CartDrawer, CartItemRow, CartTotals)
│   │   ├── contact/                     # Contact form modal and inquiry elements
│   │   ├── home/                        # Homepage components (HeroSection, FeaturedGrid, Testimonials, Footer)
│   │   ├── layout/                      # Layout wrappers (TopBanner, MainNavbar, Breadcrumbs)
│   │   ├── navbar/                      # Navigation components (SearchBar, CategoryNav, UserMenu, CartIcon)
│   │   ├── search/                      # Global search modal with instant debounced results
│   │   ├── skeleton/                    # Shimmer skeleton loaders for products, cards, and tables
│   │   ├── states/                      # Standard async states (EmptyState, ErrorState, LoadingState, OfflineState)
│   │   └── ui/                          # Design primitives (Button, Modal, Input, Badge, Accordion, Toast)
│   ├── data/                            # Static datasets, seed fallbacks, and country code tables
│   │   ├── categories.ts                # Catalog category definitions and icons
│   │   ├── countryCodes.ts              # International dialing country codes table
│   │   ├── orders.ts                    # Demo orders dataset for staging/preview testing
│   │   ├── products.ts                  # Comprehensive mock product catalog with variants
│   │   └── users.ts                     # Mock user accounts
│   ├── features/                        # Feature-driven domain modules
│   │   ├── account/                     # Account features (OrderCard, AddressModal, ReviewFormModal)
│   │   ├── admin/                       # Admin features (ProductFormModal, OrderTable, coupon management)
│   │   │   ├── components/              # Admin-specific modals, tables, and metric cards
│   │   │   ├── hooks/                   # Custom admin queries and mutation hooks
│   │   │   ├── pages/                   # Feature page implementations for admin sub-views
│   │   │   └── store/                   # Admin UI state Redux slice
│   │   ├── auth/                        # Authentication feature
│   │   │   ├── components/              # LoginForm, OtpModal, AdminProtectedRoute
│   │   │   ├── hooks/                   # useAuth, useSession, useOtp hooks
│   │   │   ├── schemas/                 # Login and OTP Zod validation schemas
│   │   │   ├── services/                # Auth API network services
│   │   │   ├── store/                   # Auth Redux slice (token, user profile, role)
│   │   │   └── types/                   # Auth domain types
│   │   ├── cart/                        # Shopping cart feature
│   │   │   ├── components/              # CartItemList, CartSummary, CouponInput
│   │   │   └── store/                   # Cart Redux slice (items, quantities, drawer open/close)
│   │   └── product/                     # Product detail & catalog feature
│   │       ├── components/              # ProductGallery, VariantSelector, ProductPrice, ReviewList
│   │       ├── data/                    # Product feature-level fallbacks
│   │       ├── hooks/                   # useProductDetail, useProductFilters
│   │       └── store/                   # Product catalog filter Redux slice
│   ├── hooks/                           # Shared cross-cutting custom hooks
│   │   ├── useAnalytics.ts              # Client event tracking (page views, add to cart, checkout start)
│   │   └── useOnlineStatus.ts           # Browser connectivity detector (triggers OfflineState)
│   ├── lib/                             # Utility functions and library abstractions
│   │   ├── errors.ts                    # API error parser and friendly toast message generator
│   │   ├── firebase.ts                  # Firebase Client SDK initializer for phone authentication
│   │   ├── format.ts                    # Formatting helpers (formatPrice in INR ₹, formatDate)
│   │   └── pincode.ts                   # India Post PIN code validator and district/state autofill
│   ├── providers/                       # React context and library provider wrappers
│   │   └── QueryProvider.tsx            # TanStack React Query client with optimized caching defaults
│   ├── schemas/                         # Centralized runtime Zod validation schemas
│   │   ├── address.schema.ts            # Shipping & billing address validation rules
│   │   ├── admin.schema.ts              # Administrative product creation and update schemas
│   │   ├── auth.schema.ts               # Customer login, register, and OTP verification schemas
│   │   ├── cart.schema.ts               # Cart item additions and quantity updates
│   │   ├── category.schema.ts           # Category creation schema
│   │   ├── common.schema.ts             # Reusable pagination, UUID, and price primitives
│   │   ├── index.ts                     # Schema barrel export
│   │   ├── order.schema.ts              # Order placement, COD verification, and status schemas
│   │   ├── payment.schema.ts            # Razorpay payment signature validation schema
│   │   ├── product.schema.ts            # Product and ProductVariant validation schemas
│   │   ├── review.schema.ts             # Customer review and star rating validation schemas
│   │   ├── user.schema.ts               # User profile update schema
│   │   └── wishlist.schema.ts           # Wishlist item manipulation schema
│   ├── services/                        # Domain service layer making HTTP calls via client.ts
│   │   ├── address.ts                   # Customer address book CRUD operations
│   │   ├── admin.ts                     # Admin product, order fulfillment, and analytics calls
│   │   ├── cart.ts                      # Server-side cart synchronization
│   │   ├── category.ts                  # Category tree queries
│   │   ├── checkout.ts                  # Checkout order submission and coupon application
│   │   ├── contact.ts                   # Contact form inquiry submissions
│   │   ├── order.ts                     # Order retrieval, tracking status, and invoice download
│   │   ├── product.ts                   # Product catalog querying, searching, filtering
│   │   ├── review.ts                    # Review fetching and submission
│   │   ├── testimonial.ts               # Testimonials listing
│   │   └── wishlist.ts                  # Wishlist add/remove operations
│   └── types/                           # Strongly-typed TypeScript interfaces and DTOs
│       ├── api/                         # Request, response, and error DTO contracts
│       └── entities/                    # Business domain entities (User, Product, Order, Address, etc.)
├── .env.development                    # Local development environment configuration
├── .env.local                          # Local override environment configuration (ignored by Git)
├── .env.production                     # Production environment configuration
├── eslint.config.mjs                    # ESLint 9 configuration with Next.js rules
├── next.config.ts                       # Next.js framework configuration (images, domains, headers)
├── package.json                         # Dependencies, scripts, and package metadata
├── postcss.config.mjs                   # PostCSS configuration for Tailwind CSS v4
├── README.md                            # Complete, single documentation file
└── tsconfig.json                        # TypeScript compiler configuration with @/* path aliases
```

---

## 4. Startup & Local Development Guide

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm**: v9.0.0 or higher
- **Backend API**: Either the local KamiraFit Express backend running on `http://localhost:10000` or the live Render staging backend.

### Step-by-Step Setup

1. **Enter project directory**:
   ```bash
   cd kamirafit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or verify `.env.development` or `.env.local`:
   ```env
   # Point to local or hosted Express backend
   NEXT_PUBLIC_API_URL=http://localhost:10000/api

   # Firebase Client Credentials for Phone Auth
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyYourFirebaseApiKey"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="kamirafit.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="kamirafit"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="kamirafit.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="952513052979"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:952513052979:web:yourAppId"
   ```

4. **Start the Development Server (with Turbopack)**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

5. **Run Linting**:
   ```bash
   npm run lint
   ```

6. **Create a Production Build**:
   ```bash
   npm run build
   ```

---

## 5. State Management & Data Flow

KamiraFit uses a clean two-tier state management design:

```mermaid
flowchart LR
    subgraph Client State (Redux Toolkit)
        direction TB
        cartSlice[Cart Slice: Items, Drawer State]
        authSlice[Auth Slice: Session Token, User Info]
        adminSlice[Admin Slice: Filter selections, Modals]
    end

    subgraph Server State (TanStack React Query)
        direction TB
        productQuery["useQuery(['products', filters])"]
        orderQuery["useQuery(['orders', orderId])"]
        orderMutation["useMutation(checkout)"]
    end

    View[React Component] -->|Dispatch| Client State
    View -->|Hook Call| Server State
    Server State -->|HTTP Request| ApiClient[Axios API Client]
```

### 1. Client State (`Redux Toolkit`)
- **Cart (`features/cart/store`)**: Instant UI responsiveness for incrementing/decrementing quantities and opening/closing the slide-over cart drawer. Persists cart state in local storage for guest shoppers.
- **Auth (`features/auth/store`)**: Stores access tokens and the authenticated user profile, hydrating immediately on page load.
- **Admin (`features/admin/store`)**: Coordinates UI state across administrative modal forms, search queries, and selected table rows.

### 2. Server State (`TanStack React Query`)
- Manages all backend asynchronous data (`src/providers/QueryProvider.tsx`).
- Configured with reasonable staleness defaults (`staleTime: 60s`) to prevent excessive refetching while navigating catalog pages.
- Automatically handles background invalidations when mutations complete (e.g. submitting a review or placing an order invalidates `['orders']` and `['product', id]`).

---

## 6. Validation & API Contracts

### Runtime Zod Validation Layer
All critical data boundaries validate payloads through Zod schemas located in `src/schemas/`:
```typescript
// Example: src/schemas/product.schema.ts
export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().min(1),
  sku: z.string().min(3),
  mrp: z.number().positive(),
  offerPrice: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;
```
This single source of truth guarantees that compile-time TypeScript types and runtime API responses are always synchronized.

### API Client (`src/api/client.ts`)
- Automatically attaches the `Authorization: Bearer <token>` header to outbound requests when a token is present.
- Extracts unique `x-request-id` headers for bug diagnostics.
- Gracefully handles `401 Unauthorized` responses by attempting automatic session restoration or redirecting to `/login`.

---

## 7. Core User Journeys & Features

### 1. Product Browsing & Sizing Selection
- **Catalog Filtering**: Filter by category (Oversized, Regular T-Shirts, Hoodies), price slider, size chips, and sort order (popularity, price low-to-high).
- **Variant Selector**: Interactive color swatches and size buttons dynamically update pricing, savings percentage badges, and live inventory availability.
- **Interactive Image Gallery**: Multi-image gallery with thumbnail navigation and desktop hover zoom.

### 2. Shopping Bag & Multi-Step Checkout
- **Slide-Over Bag Drawer**: Inspect items, modify quantities, and see real-time subtotal calculations without leaving the current browsing view.
- **PIN Code Validation**: Automatic validation using `src/lib/pincode.ts` to autofill district, city, and state for accurate delivery time estimates.
- **Payment Options**: Supports **Cash on Delivery (COD)** and **Online Payments (Razorpay)**.
- **Coupon Application**: Instant coupon discount computation with minimum order threshold checks.

### 3. Order Management & Tracking
- Customers review live status timelines: `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`.
- Active courier tracking links and AWB numbers are displayed immediately once shipped.
- GST-compliant Tax Invoice PDF can be viewed and downloaded directly with 1 click.

### 4. Dedicated Administrative Portal (`/dedicated-admin`)
- **Product Suite**: Create, edit, and deactivate products with multi-variant management, pricing overrides, cost prices, and image-color mapping.
- **Fulfillment Console**: Filter orders by status; manual fulfillment drawer allows entering courier name (e.g., Delhivery, BlueDart, Shiprocket) and manual tracking numbers.
- **Coupon Engine**: Create percentage or flat discount coupons with validity date ranges and category conditions.
- **Analytics & Queries**: Monitor total revenue, incoming customer support queries, and review customer testimonials.

---

## 8. Application Routes (Storefront & Admin)

| Route Path | Access | Description |
| :--- | :---: | :--- |
| `/` | Public | Storefront homepage with hero banners and trending drops |
| `/shop` | Public | Filterable product catalog with search, price, and category facets |
| `/product/[id]` | Public | Product detail view, image carousel, size guide, and customer reviews |
| `/cart` | Public | Dedicated shopping bag page with order breakdown |
| `/checkout` | User | Checkout flow for shipping address, billing, and payment mode |
| `/wishlist` | User | Customer favorited products |
| `/login` | Public | Customer phone OTP and email authentication |
| `/account` | User | Customer account summary dashboard |
| `/account/orders` | User | Order history, live tracking status, and invoice downloads |
| `/account/addresses`| User | Saved shipping and billing address management |
| `/account/profile` | User | Personal profile details editor |
| `/contact` | Public | Customer contact form and support inquiry submission |
| `/returns` | Public | Policy details on returns, exchanges, and refund timelines |
| `/shipping` | Public | Shipping coverage, courier details, and estimated delivery times |
| `/size-guide` | Public | Size charts for chest, waist, length across oversized & regular apparel |
| `/terms` | Public | Terms and conditions |
| `/privacy` | Public | Privacy and personal data policies |
| `/dedicated-admin` | Admin | Administrative dashboard summary |
| `/dedicated-admin/login` | Public | Protected administrative login screen |
| `/dedicated-admin/products` | Admin | Catalog management, variant pricing, inventory stock updates |
| `/dedicated-admin/orders` | Admin | Order fulfillment management, status updates, tracking AWB insertion |
| `/dedicated-admin/categories`| Admin | Category hierarchy and slug management |
| `/dedicated-admin/coupons` | Admin | Promotional discount codes and coupon rules |
| `/dedicated-admin/analytics` | Admin | Sales metrics, revenue graphs, and conversion rates |
| `/dedicated-admin/queries` | Admin | Inbound customer inquiries and contact messages |
| `/dedicated-admin/testimonials`| Admin | Customer testimonial moderation and showcase controls |

---

## 9. Deployment Guide (Vercel & Production)

The frontend is natively optimized for **Vercel** deployment.

### Deploying to Vercel

1. Push the `kamirafit` code to your GitHub repository.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository and select the **Next.js** framework preset.
4. Add the following Environment Variables in the Vercel Project Settings:
   ```env
   NEXT_PUBLIC_API_URL=https://kamirafit-backend.onrender.com/api
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKey
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kamirafit.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=kamirafit
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kamirafit.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=952513052979
   NEXT_PUBLIC_FIREBASE_APP_ID=1:952513052979:web:yourAppId
   ```
5. Click **Deploy**. Vercel will automatically build the application with Turbopack and deploy it to a global edge network.