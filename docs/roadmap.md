# Roadmap

- Replace in-memory repositories with full Prisma repositories across all modules.
- Add Redis-backed rate-limit counters and brute-force state persistence.
- Implement real BullMQ queues with workers and retry/backoff policy.
- Implement full S3 upload adapter (PutObject) and signed URLs.
- Add transactional checkout with DB locking strategy.
- Add contract tests for payment provider adapters.
- Add OpenTelemetry traces and dashboard-ready metrics.
