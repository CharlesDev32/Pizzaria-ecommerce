# Decisions (ADR)

## ADR-0001 - Modular Monolith
Use NestJS modular monolith by capability to optimize delivery speed and portfolio readability.

## ADR-0002 - In-app repository boundaries
Controllers never access persistence directly; all logic goes through services/repositories.

## ADR-0003 - JWT with refresh rotation
Use access token short-lived + refresh token rotation with session revoke support.

## ADR-0004 - Idempotent checkout
Use idempotency key to avoid duplicate order creation.

## ADR-0005 - Fake payment provider with adapter shape
Portfolio-friendly fake provider now; extension path for Stripe/MercadoPago later.
