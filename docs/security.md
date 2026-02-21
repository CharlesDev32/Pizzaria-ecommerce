# Security

## Threats and Mitigations
- Brute force on login: in-memory lock policy + throttler.
- Token abuse: access JWT + refresh rotation with session revocation.
- Privilege escalation: RBAC guard (`ADMIN`, `CUSTOMER`).
- Header/security baseline: Helmet + CORS allowlist.
- Sensitive log leakage: pino redaction paths.
- Overselling risk: stock guard before checkout.
- Duplicate checkout: idempotency key per user.
- Webhook spoofing: signature verification pattern (`x-signature`).
- Upload abuse: MIME and size validation.

## Password hashing
- argon2

## Secrets
- via env only
