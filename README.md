# Sabor Express — full-stack food delivery platform

A complete e-commerce platform for food delivery: a customer storefront, an admin
panel and a REST API, built as a pnpm monorepo with **NestJS 11**, **Next.js 14**
and **TypeScript**.

Built as a portfolio project to exercise a realistic domain end to end — auth with
refresh tokens, role-based access, inventory, coupons, delivery zones and an audit
trail — rather than a CRUD demo.

> **Scope note:** the API persists domain data in memory, not in a database. That
> was a deliberate decision to keep the focus on API design, module boundaries and
> the frontend contract. Store configuration is the exception and is persisted to
> `data/settings.json`. Swapping `StoreService` for a Prisma/TypeORM repository is
> the natural next step and the module boundaries were drawn with that in mind.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, JWT (access + refresh), Swagger, Helmet |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| State | Zustand (persisted), TanStack Query |
| Validation | Zod, class-validator |
| Monorepo | pnpm workspaces |

## What it does

**Storefront** — product catalog with categories and search, product options and
add-ons, persistent cart, checkout with address selection and delivery scheduling,
order history with a status timeline, address book, and a theme that the admin can
restyle at runtime.

**Admin panel** — metrics dashboard, product CRUD with image upload, categories,
inventory movements, order management with status transitions, discount coupons,
user management, delivery zones and time slots, audit logs, and a visual store
designer (7 theme colors, 12 Google Fonts, logo upload, promotional banner,
background texture) with live preview.

**API** — 18 domain modules, JWT auth with automatic refresh, role-based access
control (admin/customer), rate limiting at 100 req/min, brute-force protection,
global exception handling, Prometheus metrics, health checks, and Swagger docs at
`/api/v1/docs`.

## Architecture

```
.
├── src/                      # NestJS 11 — API (:3000)
│   ├── modules/              # 18 domain modules
│   │   ├── auth/             # login, register, refresh, logout
│   │   ├── catalog/          # products + image upload
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/           # orders + status timeline
│   │   ├── payments/
│   │   ├── delivery/         # zones, neighborhoods, time slots
│   │   ├── addresses/
│   │   ├── coupons/
│   │   ├── inventory/
│   │   ├── users/
│   │   ├── settings/         # theme, logo, fonts
│   │   ├── files/
│   │   ├── health/
│   │   ├── metrics/          # Prometheus
│   │   └── audit-log/
│   ├── common/               # guards, filters, decorators, middleware
│   └── shared/store/         # StoreService — in-memory persistence
│
├── apps/
│   ├── web/                  # Next.js 14 — storefront (:3001)
│   └── admin/                # Next.js 14 — admin panel (:3002)
│
└── packages/
    └── shared/               # @pizza/shared — HTTP clients, types, Zod schemas, utils
```

The `@pizza/shared` package is what makes the monorepo worth it: HTTP clients,
TypeScript interfaces and Zod schemas are declared once and consumed by both
frontends, so a change to an API contract breaks the build instead of breaking
production.

## Running it

Requires Node.js 18+ and pnpm 8+.

```bash
git clone https://github.com/CharlesDev32/Pizzaria-ecommerce.git
cd Pizzaria-ecommerce
pnpm install

pnpm start:dev   # API on :3000
pnpm dev         # storefront on :3001 and admin on :3002
```

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/v1/docs |
| Storefront | http://localhost:3001 |
| Admin | http://localhost:3002 |

The API seeds two demo accounts on boot. They exist only in the in-memory store of
your local instance, so the credentials are in
[`src/shared/store/seed.ts`](src/shared/store/seed.ts) rather than in this README.

## Scripts

```bash
pnpm start:dev    # API with hot reload
pnpm dev          # storefront + admin in parallel
pnpm dev:web      # storefront only
pnpm dev:admin    # admin only
pnpm build        # build the API
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Jest
pnpm typecheck    # TypeScript across all projects
```

## Runtime theming

The admin saves changes to `/settings`; the API persists them via
`PATCH /api/v1/settings` to `data/settings.json`; the storefront reads them from
`GET /api/v1/settings` and a `ThemeProvider` injects CSS custom properties on
`:root` and loads the selected Google Fonts dynamically. No rebuild, no redeploy.

## License

MIT — see [LICENSE](LICENSE).
