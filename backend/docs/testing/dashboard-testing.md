# Dashboard Module Testing Guide

This document outlines the testing strategy for the Kredl Dashboard module.

## Facade Pattern Mocking

The Dashboard module introduces a `DashboardFacadeService` designed solely for cross-module aggregation. Testing this service requires robust mocking strategies to ensure 100% branch coverage without instantiating the heavy domain services it depends on.

### Core Philosophy
1. **Mock everything outside the Facade:** Do not import actual `UsersService` or `DashboardService`.
2. **Control `Promise.all()`:** Tests must simulate various states of resolution and rejection to verify the concurrent loading logic.

### Example Mock Setup
```typescript
const mockDashboardService = {
  getContinueLearning: jest.fn(),
  getProgressSummary: jest.fn(),
  getRecentActivity: jest.fn(),
};

const mockUsersService = {
  getDashboardProfile: jest.fn(),
};

// Injection
{ provide: DashboardService, useValue: mockDashboardService }
```

## Branch Coverage Goals

To maintain 100% branch coverage on the Facade, tests must assert:
- `getDashboardProfile` resolving successfully.
- `getDashboardProfile` returning `null` (asserts `NotFoundException`).
- Child services (e.g. `getContinueLearning`) rejecting (asserts `Promise.all` propagation).
- Handling of empty arrays / null objects where optional (e.g., no active notifications or continue learning paths).

## Performance Testing
In E2E tests, the `/dashboard` endpoint should consistently respond in `<300ms`. When mocking the DB in Jest, this is artificially fast, so E2E tests against an actual staging DB using `Artillery` or `k6` are recommended for verifying the `Promise.all()` latency benefits.
