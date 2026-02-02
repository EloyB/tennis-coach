# Feature Flags

Feature flags are used to ship features safely across environments.

They allow:

- incremental rollout
- safe testing in dvlp/staging
- instant rollback without redeploying

---

## Naming Convention

Use descriptive, scoped names:

Good:

- `feature.newBillingUI`
- `feature.clientPortalV2`
- `feature.stripeSubscriptions`

Avoid:

- `feature.test`
- `feature.tmp`
- `feature.newThing`

---

## Default Behavior

When introducing a new flag:

| Environment | Default |
| ----------- | ------- |
| dvlp        | ON      |
| staging     | ON      |
| prod        | OFF     |

If this differs, document why.

---

## Usage Rules

- Prefer **one flag decision point** per feature
- Avoid scattering flag checks across many components/services
- Flags should wrap **entry points**, not low-level helpers
- Remove flags once a feature is fully rolled out and stable

---

## Frontend Usage

- Flags should be evaluated at page, route, or feature-container level
- UI components should not be responsible for flag logic
- Hidden features should not leak via navigation or deep links

---

## Backend Usage

- Flags may guard:
  - endpoints
  - execution paths
  - background jobs
- Prefer centralized flag evaluation helpers
- Backend should be the source of truth when behavior matters

---

## Flag Lifecycle

1. Introduced (behind flag, OFF in prod)
2. Enabled in staging
3. Enabled in prod
4. Stabilized
5. Flag removed and code cleaned up

---

## Documentation Requirement

Every new feature flag must be documented in this file with:

- name
- purpose
- environments enabled
- expected removal point

---

## Active Feature Flags

### `feature.trainingSessionManagement`

**Purpose:** Enables the training session management feature, allowing coaches to create, view, edit, and cancel training sessions.

**Environments:**

| Environment | Status |
| ----------- | ------ |
| dvlp        | ON     |
| staging     | ON     |
| prod        | OFF    |

**Added:** 2026-02-02

**Expected removal:** After MVP validation and initial user feedback
