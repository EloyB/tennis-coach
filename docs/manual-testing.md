# Manual Testing Checklist

Because this project currently has no automated tests, **manual verification is required** for every feature.

Each feature should add or update a section below.

---

## Template (Copy Per Feature)

### Feature

Name:
Flag:
Description:

### Environment

- [ ] dvlp
- [ ] staging

### Setup

- Feature flag state:
- Test user / role:
- Test data required:

### Steps

1.
2.
3.

### Expected Result

- ...

### Edge Cases

- ...

### Rollback Plan

- Disable feature flag
- Revert commit if necessary

---

## Verification Rules

- Every feature must be verified in `dvlp`
- Risky features should also be verified in `staging`
- If verification is skipped, explain why

---

## Common Scenarios to Test

- Unauthorized access
- Empty states
- Error handling
- Slow network / loading states
- Feature flag OFF behavior
