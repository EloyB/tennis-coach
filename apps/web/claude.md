# Claude Instructions — apps/web (Next.js + Bun)

## Mission

Implement frontend product features quickly and safely, aligned with the backend contract and feature flags.

Optimize for:

- minimal diffs
- correct server/client boundaries
- accessible, responsive UI
- clear loading/error/empty states

---

## Tech

- Next.js (assume App Router unless repo shows otherwise)
- TypeScript
- Bun

Commands (use existing package.json scripts):

- Install: `bun install`
- Dev: `bun dev`
- Build: `bun run build` (or repo script)
- Lint: `bun run lint` (if present)

Do not invent scripts; use what exists.

---

## Feature Flags

- New features should be gated behind the repo’s feature-flag system.
- Prefer a single flag decision point at route/page/container level.
- Keep flag logic out of small leaf components when possible.

---

## Next.js Rules

- Do not add `"use client"` unless required.
- Prefer server components for data fetching when appropriate.
- Avoid pushing sensitive logic to the client.
- Be mindful of bundle size; avoid heavy dependencies.

---

## UX Requirements

Every new feature should include as relevant:

- loading state
- error state
- empty state
- success feedback for mutations
- accessible labels and keyboard-friendly interactions

---

## Data / Contract Discipline

- Follow the API contract exactly.
- If the API changes, update the UI accordingly and document the change.
- Prefer typed API clients/helpers that match existing patterns.

---

## Output Format

### Plan

### Feature Flag

### Changes (files + what)

### How to verify (manual)

### Notes / Risks
