# KamiraFit

KamiraFit is a Next.js storefront and admin dashboard for a clothing business. The current codebase is the frontend application: it includes the shopping experience, cart, wishlist, checkout UI, product browsing, search, and a protected demo admin area. The production backend is planned separately with Node.js, Express, and MongoDB.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Status](#project-status)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [Security](#security)
- [Performance](#performance)
- [Deployment on Vercel](#deployment-on-vercel)
- [Backend Integration Plan](#backend-integration-plan)
- [Quality Checks](#quality-checks)
- [Recommended Production Checklist](#recommended-production-checklist)

## Tech Stack

- Framework: Next.js 15 App Router
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS 4
- State: Redux Toolkit + React Redux
- Hosting: Vercel
- Package manager: npm

## Features

- Responsive ecommerce storefront
- Home page with hero, featured products, categories, testimonials, and newsletter UI
- Shop page with filtering, sorting, product grid, and mobile filters
- Product detail pages generated from static product data
- Cart and wishlist state
- Checkout UI with shipping form validation
- Spotlight search
- Dedicated admin dashboard under `/dedicated-admin`
- Admin product, category, order, and user management UI
- Security headers, admin route protection, and image host configuration

## Project Status

This repository currently contains the frontend and mock/admin UI state only.

Important notes:

- Product, order, category, and user data are currently local seed data.
- Admin changes are client-side demo state and are not persisted to a database yet.
- Checkout is a UI flow only. No real payment gateway is connected yet.
- The backend will be developed later with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

Install:

- Node.js 20 or newer
- npm

Check your versions:

```bash
node --version
npm --version
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist yet, create `.env.local` manually:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-to-a-long-random-password
NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS=images.unsplash.com
```

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin area:

```text
http://localhost:3000/dedicated-admin
```

In development, if `ADMIN_USERNAME` or `ADMIN_PASSWORD` is missing, the admin route is allowed so local work is not blocked. In production, missing admin credentials fail closed.

## Environment Variables

| Variable | Required | Used By | Description |
| --- | --- | --- | --- |
| `ADMIN_USERNAME` | Production | Middleware | Basic Auth username for `/dedicated-admin`. |
| `ADMIN_PASSWORD` | Production | Middleware | Basic Auth password for `/dedicated-admin`. Use a long random value. |
| `NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS` | Recommended | Next image config + CSP | Comma-separated HTTPS image hosts allowed by `next/image` and CSP. |

Example:

```env
ADMIN_USERNAME=kamirafit-admin
ADMIN_PASSWORD=use-a-password-manager-generated-secret
NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS=images.unsplash.com,res.cloudinary.com,cdn.kamirafit.com
```

When the real backend/media pipeline is ready, replace the demo image host with the production media host.

## Available Scripts

```bash
npm run dev
```

Starts the development server with Turbopack.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Runs the production build locally. Run `npm run build` first.

```bash
npm run lint
```

Runs ESLint.

Recommended security check:

```bash
npm audit
```

## Architecture

High-level structure:

```text
app/
  layout.tsx                    Root layout and global providers
  page.tsx                      Home page
  shop/                         Product listing route
  product/[id]/                 Product detail route
  cart/                         Cart route
  checkout/                     Checkout UI route
  wishlist/                     Wishlist route
  dedicated-admin/              Protected admin route group

components/
  home/                         Home page sections
  layout/                       Shared page shell
  navbar/                       Navigation/category menu
  search/                       Spotlight search
  ui/                           Reusable UI primitives
  admin/                        Admin-specific shared components

features/
  product/                      Product UI, product types, product store hooks
  cart/                         Cart and checkout components/utilities
  admin/                        Admin pages, admin Redux store, admin components

data/
  products.ts                   Storefront product data re-export
  orders.ts                     Mock order data
  users.ts                      Mock user data
  categories.ts                 Mock category data

lib/
  format.ts                     Formatting helpers

middleware.ts                   Admin Basic Auth middleware
next.config.ts                  Security headers, image config, Next settings
```

### Design Approach

The app uses route-level composition in `app/`, feature modules under `features/`, and reusable display components under `components/`. Public storefront code and admin code are intentionally separated so customer-facing bundles do not depend on admin-only state.

## Routing

Public routes:

- `/`
- `/shop`
- `/product/[id]`
- `/cart`
- `/checkout`
- `/wishlist`

Admin routes:

- `/dedicated-admin`
- `/dedicated-admin/products`
- `/dedicated-admin/categories`
- `/dedicated-admin/orders`
- `/dedicated-admin/users`

The admin route group is:

- protected by middleware Basic Auth
- marked `noindex`
- served with `Cache-Control: no-store`
- forced dynamic with `revalidate = 0`

## State Management

There are two Redux stores:

- Storefront store: cart and wishlist only
- Admin store: products, orders, categories, and users

This separation avoids leaking admin-oriented data into the customer storefront state tree.

Current state is client-side only. Once the backend is ready, admin mutations and checkout/order actions should be moved to authenticated API calls.

## Security

Implemented frontend/security hardening:

- Admin Basic Auth middleware for `/dedicated-admin`
- Timing-safe credential comparison
- Production fail-closed behavior if admin credentials are missing
- Security headers:
  - Content Security Policy
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - `Cross-Origin-Opener-Policy`
  - HSTS in production
- Admin `no-store` cache policy
- Admin `X-Robots-Tag: noindex, nofollow, noarchive`
- `next/image` remote hosts controlled by `NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS`
- SVG image optimization disabled
- Dependency override for patched `postcss`

Security expectations for the future backend:

- Do not trust frontend cart totals or product prices.
- Recalculate order totals server-side.
- Use server-side authentication and authorization.
- Validate every API request with a schema library.
- Verify payment provider webhooks server-side.
- Store sensitive secrets only in environment variables.

## Performance

Current optimizations:

- Next.js App Router with static generation for public product pages
- Turbopack for development/build script
- `next/font` for optimized local font delivery
- `next/image` with AVIF/WebP support
- Long image cache TTL
- Public pages can be statically cached
- Admin pages are dynamic and uncached
- Public storefront Redux store excludes admin reducers

Build output should be checked before deployment:

```bash
npm run build
```

## Deployment on Vercel

This project is intended to deploy on Vercel.

### Vercel Setup

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Use the default framework preset: Next.js.
4. Set environment variables in Vercel Project Settings.
5. Deploy.

### Build Settings

Vercel should detect these automatically:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

### Required Vercel Environment Variables

Set these for Production, Preview, and Development as needed:

```env
ADMIN_USERNAME=kamirafit-admin
ADMIN_PASSWORD=use-a-long-random-secret
NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS=images.unsplash.com
```

When real product media is hosted elsewhere:

```env
NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS=cdn.kamirafit.com,res.cloudinary.com
```

### Admin Deployment Notes

The admin area currently uses Basic Auth as a temporary frontend-era guard. After the backend is ready, replace this with real backend-backed admin authentication and role-based access control.

## Backend Integration Plan

The planned backend stack is Node.js, Express, and MongoDB.

Recommended backend responsibilities:

- Authentication:
  - admin login
  - customer login, if customer accounts are added
  - password hashing with Argon2id or bcrypt
  - secure session cookies or refresh-token rotation

- Authorization:
  - role-based access control
  - admin-only product/category/order/user APIs
  - server-side ownership checks for customer orders

- Products:
  - product CRUD
  - product status
  - category filters
  - image/media references
  - inventory tracking

- Cart and checkout:
  - server-side price calculation
  - coupon validation, if added
  - shipping calculation, if added
  - order creation

- Payments:
  - Stripe, Razorpay, Cashfree, or another provider
  - hosted payment pages
  - signed webhook verification
  - update order payment state only from verified webhooks

- Orders:
  - order status management
  - payment status
  - admin order notes
  - customer notifications

- Media:
  - upload product images to a controlled media service
  - store image URLs or public IDs in MongoDB
  - expose only approved CDN/media hosts to the frontend

Suggested API shape:

```text
GET    /api/products
GET    /api/products/:id
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status

POST   /api/checkout
POST   /api/payments/webhook

POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
```

## Quality Checks

Run before opening a PR or deploying:

```bash
npm run lint
npm run build
npm audit
```

Optional local production smoke test:

```bash
npm run build
npm run start
```

Then visit:

```text
http://localhost:3000
http://localhost:3000/shop
http://localhost:3000/cart
http://localhost:3000/checkout
http://localhost:3000/dedicated-admin
```

## Recommended Production Checklist

Before using this for real customers:

- Replace mock data with backend APIs.
- Replace Basic Auth with proper admin authentication.
- Add server-side authorization to every admin API.
- Add real payment gateway integration.
- Verify payment status using signed webhooks.
- Recalculate cart totals on the backend.
- Add database backups.
- Add monitoring and error tracking.
- Add rate limiting on auth, checkout, newsletter, and admin routes.
- Add audit logs for admin changes.
- Add automated tests for checkout, admin auth, product CRUD, and payment webhooks.
- Configure production image host in `NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS`.

## License

This project is private and proprietary to KamiraFit.
