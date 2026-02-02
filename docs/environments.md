# Environments

This project runs in multiple environments with different risk profiles.

## Supported Environments

- `dvlp` – local development and experimentation
- `staging` – pre-production validation
- `prod` – live production environment

The active environment is determined by:

- Frontend: environment variables at build/runtime
- Backend: `ASPNETCORE_ENVIRONMENT` and environment variables

---

## Environment Rules

### General

- `prod` must be treated as immutable and conservative
- New features should never be enabled in `prod` by default
- Secrets are provided via environment variables only
- `.env` files must never be committed

### Frontend

Typical environment variables:

- `NEXT_PUBLIC_ENV`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FEATURE_FLAGS` (if applicable)

Notes:

- `NEXT_PUBLIC_*` variables are exposed to the client
- Do not expose secrets or internal URLs

### Backend

Typical environment variables:

- `ASPNETCORE_ENVIRONMENT`
- `DATABASE_URL` or connection strings
- `AUTH_*`
- `STRIPE_*` (when Stripe is introduced)

Configuration layering:

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. environment variables (highest priority)

---

## Environment Defaults

| Feature type      | dvlp | staging | prod |
| ----------------- | ---- | ------- | ---- |
| New feature flags | ON   | ON      | OFF  |
| Verbose logging   | ON   | ON      | OFF  |
| Test data         | YES  | LIMITED | NO   |
| Stripe test mode  | YES  | YES     | NO   |

---

## Verification Expectation

Every feature should be manually verified in:

- `dvlp` (required)
- `staging` (recommended if risky)

Verification steps must be documented in `docs/manual-testing.md`.
