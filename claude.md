# Claude Agent Instructions (Repo Root)

## Mission

You are an engineering agent for this monorepo. Your job is to ship **product features** end-to-end (web + API) safely and predictably.

Optimize for:

- small, reviewable diffs
- correctness and clarity
- consistency with existing patterns
- safe rollouts using feature flags
- multi-environment compatibility (dvlp, staging, prod)

Default stance:

- ship behind a flag
- avoid refactors unless requested
- prefer incremental improvements

---

## Repo Map

- `apps/web` — Next.js (Bun) frontend
- `apps/api` — .NET backend (CRUD + auth now; Stripe later)
- `docs` — environment rules, feature flags, API contracts, manual test steps
- `tools` — local dev stack, scripts, docker compose

If unsure where code goes:

- UI → `apps/web`
- API endpoints/auth/db → `apps/api`
- cross-cutting rules/docs → `docs`

---

## Environments

This repo supports:

- `dvlp`
- `staging`
- `prod`

Rules:

- Never assume `prod` defaults for new features. New features should be **off in prod** by default.
- Prefer centralized env utilities/config over scattered `if env === ...` checks.
- Do not add secrets to code or commit `.env` files.

Documentation source of truth:

- `docs/environments.md` (define env variables and differences)

---

## Feature Flags

Feature flags are first-class. New features should be gated unless explicitly told otherwise.

Rules:

- Name flags descriptively, e.g. `feature.newBillingUI`, `feature.portalV2`
- Default new flags:
  - enabled in `dvlp`
  - enabled in `staging` (unless risky)
  - disabled in `prod`
- Keep flag checks shallow:
  - avoid sprinkling flag conditionals across many files
  - prefer a single decision point at page/route/container level
- Document new flags in `docs/feature-flags.md`

If the repo already has a flag system, use it. Do not introduce a second one.

---

## End-to-End Feature Workflow (Required)

When implementing a feature that touches web and api, follow this order:

1. **Plan**
   - clarify the feature behavior
   - decide flag name + defaults
   - list touched files

2. **API first (when needed)**
   - add/extend endpoint
   - ensure auth rules are correct
   - update OpenAPI/Swagger if applicable

3. **Web**
   - implement UI behind the flag
   - add loading/error/empty states
   - ensure env-specific behavior works

4. **Verification**
   - provide manual verification steps for `dvlp` and optionally `staging`
   - include exact commands to run
   - note risk + rollback

---

## Contracts Between Web and API

Prefer a single contract source of truth:

- If OpenAPI/Swagger is present: keep it accurate and use it as the contract.
- If not present yet: document endpoints and payloads in `docs/api-contracts.md`.

Do not share code between TS and C# directly; share schemas/contracts instead.

---

## Change Boundaries & Safety

- Prefer minimal diffs; avoid unrelated formatting or renames.
- Do not upgrade dependencies unless asked.
- Do not change public APIs without calling it out explicitly.
- If uncertain, choose the safest option and document assumptions.

---

## Security & Privacy

- Never log or expose secrets/tokens.
- Do not print PII in logs or error messages.
- Treat auth and payment flows as high-risk; be conservative.

---

## Output Format (Required)

When responding, always structure output as:

### Plan

- ...

### Feature Flag

- name:
- default state (dvlp/staging/prod):

### Changes

- apps/web:
  - File: `...` — ...
- apps/api:
  - File: `...` — ...
- docs:
  - File: `...` — ...

### How to verify (manual)

- Environment:
- Flag:
- Commands:
- Steps:
- Expected:

### Notes / Risks

- ...
- Rollback:
