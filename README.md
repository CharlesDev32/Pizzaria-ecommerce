# Sabor Express — full-stack food delivery platform

A food delivery e-commerce platform built as a pnpm monorepo: a **NestJS 11** API,
a **Next.js 14** customer storefront and a **Next.js 14** admin panel, backed by
PostgreSQL, Redis and S3-compatible object storage.

Built to exercise a realistic production stack end to end rather than a CRUD demo —
background job queues, structured logging with redaction, Prometheus metrics,
database migrations and a CI pipeline are all part of it.

## Stack

| Layer | Technology |
|---|---|
| API | NestJS 11, TypeScript 5.9, Node 22 |
| Database | PostgreSQL 16 via Prisma 6 (migrations + seed) |
| Cache & queues | Redis 7, BullMQ |
| Object storage | S3 (AWS SDK v3) — MinIO locally |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Client state | Zustand (persisted), TanStack Query |
| Validation | Zod 4, class-validator |
| Auth | JWT access + refresh, Argon2 password hashing |
| Observability | Pino structured logs, prom-client, health checks |
| Docs | Swagger / OpenAPI |
| Testing | Jest, Supertest (unit + e2e) |
| Tooling | pnpm workspaces, ESLint 9, Prettier, Docker Compose |

## What it does

**Storefront** — product catalog with categories and search, product options and
add-ons, persistent cart, checkout with address selection and delivery scheduling,
order history with a status timeline, address book, and a theme the admin can
restyle at runtime.

**Admin panel** — metrics dashboard, product CRUD with image upload, categories,
inventory movements, order management with status transitions, discount coupons,
user management, delivery zones and time slots, audit logs, and a visual store
designer (theme colors, Google Fonts, logo, promotional banner) with live preview.

**API** — 18 domain modules covering auth, catalog, categories, cart, checkout,
orders, payments, delivery, addresses, coupons, inventory, users, settings, files,
health, metrics and audit logging.

## Engineering notes

The parts worth looking at:

- **Auth.** Argon2 for password hashing, not bcrypt. Short-lived access tokens
  (15 min) with long-lived refresh tokens (30 days), both carrying an explicit
  issuer and audience. Auth endpoints get their own stricter rate limit on top of
  the global one, plus a brute-force block window.
- **Logging that does not leak.** Pino is configured to redact
  `authorization` headers, `password` and `refreshToken` bodies and `set-cookie`
  responses. Structured logs are only useful if you can ship them somewhere, and
  that is only safe if secrets never enter them.
- **Slow work goes on a queue.** BullMQ over Redis keeps uploads, mail and other
  slow operations off the request path.
- **Uploads are validated at the edge of the system.** MIME allowlist
  (JPEG/PNG/WebP) and a hard size ceiling before anything reaches storage.
- **Health checks have timeouts.** The database and Redis probes fail fast rather
  than hanging the health endpoint, which is the difference between a load balancer
  rotating a bad instance out and leaving it in.
- **CI on every push and pull request** — lint, test, then build. Nothing merges
  on a red pipeline.

## Architecture

```
.
├── src/                      # NestJS 11 — API (:3000)
│   ├── modules/              # 18 domain modules
│   ├── common/               # guards, filters, decorators, middleware
│   └── shared/prisma/        # PrismaService
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── apps/
│   ├── web/                  # Next.js 14 — storefront (:3001)
│   └── admin/                # Next.js 14 — admin panel (:3002)
│
├── packages/
│   └── shared/               # @pizza/shared — HTTP clients, types, Zod schemas
│
├── docker/minio/             # bucket bootstrap
├── test/                     # e2e suite
└── .github/workflows/ci.yml
```

The `@pizza/shared` package is what makes the monorepo worth it: HTTP clients,
TypeScript interfaces and Zod schemas are declared once and consumed by both
frontends, so a change to an API contract breaks the build instead of breaking
production.

## Running it

Requires Node.js 22+, pnpm 10+ and Docker.

```bash
git clone https://github.com/CharlesDev32/Pizzaria-ecommerce.git
cd Pizzaria-ecommerce

cp .env.example .env          # then set the JWT secrets
docker compose up -d          # postgres, redis, minio, mailhog

pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

pnpm start:dev                # API  :3000
pnpm dev                      # web  :3001  +  admin :3002
```

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/v1/docs |
| Storefront | http://localhost:3001 |
| Admin | http://localhost:3002 |
| MinIO console | http://localhost:9001 |
| MailHog | http://localhost:8025 |

Demo accounts are created by `prisma/seed.ts` and exist only in your local
database.

## Scripts

```bash
pnpm start:dev        # API with hot reload
pnpm dev              # storefront + admin in parallel
pnpm prisma:migrate   # apply migrations in development
pnpm prisma:deploy    # apply migrations in production
pnpm prisma:seed      # seed demo data
pnpm test             # unit tests
pnpm test:e2e         # end-to-end tests
pnpm test:cov         # coverage
pnpm lint             # ESLint
pnpm typecheck        # TypeScript across all projects
pnpm build            # build the API
```

## Runtime theming

The admin saves theme changes through the settings module; the storefront reads
them and a `ThemeProvider` injects CSS custom properties on `:root` and loads the
selected Google Fonts dynamically. No rebuild, no redeploy.

## License

MIT — see [LICENSE](LICENSE).
