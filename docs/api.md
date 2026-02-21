# API Conventions

## Base URL
- `/api/v1`

## Auth
- `Authorization: Bearer <accessToken>`

## Request ID
- Header input/output: `x-request-id`

## Pagination
- Query: `page`, `limit`
- Response: `{ data, page, limit, total }`

## Error format
```json
{
  "timestamp": "2026-02-18T14:00:00.000Z",
  "path": "/api/v1/auth/login",
  "requestId": "...",
  "code": "HTTP_401",
  "message": "Invalid credentials",
  "details": null
}
```

## Idempotency
- Checkout header: `Idempotency-Key`
