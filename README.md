# Monorepo — Web + API

This repository contains a Next.js frontend and a .NET backend in a single monorepo, designed for feature-driven development, multi-environment deployments, safe rollouts using feature flags, and efficient collaboration with AI agents (Claude).

## Repository Structure

repo/
apps/
web/ Next.js frontend (Bun)
api/ .NET backend (CRUD + auth, Stripe-ready)
docs/ Environment, feature flag, API, and testing docs
tools/ Local dev tooling (Docker, scripts)
claude.md Root instructions for Claude

Each application also contains its own claude.md with app-specific rules.

## Environments

The project supports three environments:

dvlp – local development  
staging – pre-production validation  
prod – production

Environment rules, variables, and defaults are documented in docs/environments.md.

Defaults:

- New features are enabled in dvlp
- Enabled in staging
- Disabled in prod
- Secrets are provided via environment variables only
- .env files must never be committed

## Feature Flags

Feature flags are a core concept in this repository.

- New features should be gated behind a feature flag by default
- Flags are documented in docs/feature-flags.md
- Frontend and backend must follow the same flag definitions

If you are unsure whether a feature needs a flag: add one.

## Getting Started (Local Development)

### Prerequisites

- Bun (frontend)
- .NET SDK (backend)
- Docker (optional, for databases or shared services)

## Frontend (Next.js)

Location: apps/web

Install dependencies:
bun install

Run in development:
bun dev

Frontend will typically be available at http://localhost:3000

Environment variables:

- Copy .env.example to .env.local
- Fill in required variables as described in docs/environments.md

## Backend (.NET API)

Location: apps/api

Build the solution:
dotnet build

Run the API:
dotnet run --project src/Api/Api.csproj

Backend will typically be available at http://localhost:5000

Swagger / OpenAPI (if enabled):
http://localhost:5000/swagger

Environment variables:

- Set ASPNETCORE_ENVIRONMENT=dvlp
- Configure database, auth, and other secrets via environment variables
- See docs/environments.md for details

## Running Frontend and Backend Together

- Run frontend and backend in separate terminals
- The frontend communicates with the backend via an environment-configured API base URL
- Optional shared services can be started using Docker Compose from tools/

## API Contracts

Frontend and backend communication follows explicit contracts.

Source of truth:

- OpenAPI / Swagger (preferred)
- docs/api-contracts.md (fallback documentation)

Rules:

- Do not share code between TypeScript and C#
- Share schemas/contracts, not implementations
- Breaking API changes must be explicitly documented

## Manual Testing

There are currently no automated tests.

Every feature must include manual verification steps, documented in docs/manual-testing.md.

At minimum:

- Verify in dvlp
- Document steps, expected results, and rollback plan

## Feature Development Workflow

Expected workflow for new features:

1. Plan the feature
2. Define a feature flag and default states
3. Implement backend changes if required
4. Implement frontend UI behind the feature flag
5. Manually verify
6. Document verification steps

Detailed rules and expectations are defined in:

- claude.md (root)
- apps/web/claude.md
- apps/api/claude.md

## Stripe (Future Integration)

Stripe is not yet implemented, but the backend structure is prepared for it.

Guidelines:

- Stripe SDK usage will live in Infrastructure
- Webhooks are the source of truth
- Client-side payment state is never trusted

See apps/api/claude.md for Stripe-specific rules.

## Working With Claude

This repository is designed to work smoothly with Claude.

Claude will:

- follow rules defined in claude.md
- respect environments and feature flags
- prefer small, safe, reviewable changes
- document manual verification steps

If behavior is unclear, update the relevant claude.md or docs file. These are treated as the source of truth.

## Notes

- Prefer incremental feature development over refactors
- Avoid dependency upgrades unless explicitly required
- Production stability is the highest priority
