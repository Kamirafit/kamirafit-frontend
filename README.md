# KamiraFit

Modern apparel ecommerce platform built with Next.js, TypeScript, Redux Toolkit, React Query, and a scalable domain-driven frontend architecture.

---

## Overview

KamiraFit is an ecommerce platform focused on fashion and lifestyle products including:

- Oversized T-Shirts
- Round Neck T-Shirts
- Hoodies
- Pet Collection

The application is currently in active development.

At this stage:

- Frontend architecture is implemented.
- Product, cart, wishlist, account, and admin flows are available.
- Mock API infrastructure is used for development and UI testing.
- Runtime validation is implemented using Zod.
- Backend integration is planned for a future phase.

---

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### State Management

- Redux Toolkit
- React Redux

### Server State

- TanStack React Query

### Validation

- Zod

### Networking

- Axios

### Development Infrastructure

- Centralized Mock API
- DTO Contracts
- Runtime Validation
- Feature-Based Architecture

---

## Architecture

The project follows a feature-driven architecture designed for long-term scalability.

```text
src/
├── app/
├── api/
├── components/
├── data/
├── features/
├── hooks/
├── providers/
├── services/
├── types/
├── schemas/
└── lib/
```

---

## Domain Model

Entities are organized by domain.

```text
src/types/entities/
├── address.ts
├── admin.ts
├── auth.ts
├── cart.ts
├── category.ts
├── common.ts
├── order.ts
├── payment.ts
├── product.ts
├── review.ts
├── user.ts
├── wishlist.ts
└── index.ts
```

---

## Product Architecture

Products support variant-based inventory.

```text
Product
 ├── id
 ├── title
 ├── description
 ├── category
 ├── brand
 ├── variants[]
 └── metadata

Variant
 ├── id
 ├── sku
 ├── size
 ├── color
 ├── inventory
 ├── images
 ├── price
 └── salePrice
```

This structure supports:

- Multiple sizes
- Multiple colors
- Independent inventory
- Independent pricing
- Multiple product images
- SKU management

---

## Validation Layer

Runtime validation is implemented using Zod.

```text
src/schemas/
├── address.schema.ts
├── admin.schema.ts
├── auth.schema.ts
├── cart.schema.ts
├── category.schema.ts
├── order.schema.ts
├── payment.schema.ts
├── product.schema.ts
├── review.schema.ts
├── user.schema.ts
└── wishlist.schema.ts
```

TypeScript types are derived directly from schemas where applicable.

Example:

```ts
export type Product = z.infer<typeof ProductSchema>;
```

This ensures compile-time and runtime safety.

---

## API Contract Layer

API contracts are centralized and versionable.

```text
src/types/api/
```

Contains:

- Request DTOs
- Response DTOs
- Error DTOs

The frontend is developed against stable contracts before backend implementation.

---

## Mock API Infrastructure

A centralized Mock API layer is used during development.

```text
Component
    ↓
React Query Hook
    ↓
Service Layer
    ↓
Mock API
    ↓
Mock Data
```

Benefits:

- Frontend development is independent of backend availability.
- Easy transition to real APIs.
- Consistent network simulation.
- Contract validation.

---

## Async State System

Reusable state components exist for all asynchronous operations.

### Supported States

- Loading
- Success
- Empty
- Error
- Offline

Reusable components:

```text
LoadingState
EmptyState
ErrorState
OfflineState
RouteErrorState
```

---

## Authentication

Current authentication is mock-based and intended for development only.

Features:

- Customer Login
- Admin Login
- Session Restoration
- Auth Storage Abstraction

Future production implementation:

- JWT Authentication
- Refresh Tokens
- Protected APIs
- Role-Based Access Control

---

## Application Routes

### Storefront

```text
/
/shop
/product/[id]
/cart
/checkout
/wishlist
```

### Customer Account

```text
/account
/account/profile
/account/orders
/account/addresses
/account/pan
```

### Admin

```text
/dedicated-admin
/dedicated-admin/login
/dedicated-admin/products
/dedicated-admin/orders
/dedicated-admin/users
/dedicated-admin/categories
```

---

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Current Status

### Completed

- Frontend Architecture
- Product Catalog
- Cart Flow
- Wishlist Flow
- Account Flow
- Admin Flow
- React Query Integration
- Redux Toolkit Integration
- Mock API Infrastructure
- API Contracts
- Zod Validation
- Error Handling Infrastructure

### In Progress

- Backend Development
- Database Integration
- Authentication APIs

### Planned

- MongoDB
- Node.js Backend
- JWT Authentication
- Razorpay Integration
- Shiprocket Integration
- Email Notifications
- Analytics
- SEO Enhancements
- Production Deployment

---

## Engineering Principles

The project follows:

- Feature-based architecture
- Domain-driven modeling
- Strict TypeScript
- Runtime validation
- Reusable UI patterns
- Contract-first API design
- Separation of concerns
- Scalability-first development

---

## Future Roadmap

### Backend

- Node.js
- Express
- MongoDB
- JWT Authentication

### Commerce

- Product Management
- Order Management
- Inventory Management
- Coupon System

### Payments

- Razorpay

### Logistics

- Shiprocket

### Growth

- Google Analytics
- Meta Pixel
- SEO Optimization
- Performance Optimization

---

## License

Private project.
All rights reserved.

© KamiraFit