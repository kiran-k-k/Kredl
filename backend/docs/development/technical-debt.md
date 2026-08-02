# Kredl Technical Debt & Future Enhancements

This document tracks technical debt, deferred tasks, and future optimizations. 

## Classification

### 1. Strict Typing in Tests
- **Level:** Low
- **Description:** Some E2E tests (`auth.e2e-spec.ts`, `auth-matrix.e2e-spec.ts`) and specific services currently use implicit `any` assignments or unsafe member access which triggers `@typescript-eslint/no-unsafe-assignment`.
- **Risk:** Type safety is reduced in the test environment and specific non-auth modules, slightly increasing the risk of refactoring errors.
- **Recommended Phase:** Phase 6 (Global Refactor Pass)
- **Estimated Effort:** Medium (requires mapping exact typings for mock requests and database responses).

### 2. Rate Limit Tuning
- **Level:** Medium
- **Description:** Global rate limits are applied, but fine-grained endpoint-specific limits (e.g., highly aggressive limits for `/login`) could be further calibrated for production traffic.
- **Risk:** Potential for distributed brute-force attacks if the global limit is too generous.
- **Recommended Phase:** Phase 18 (Performance & Security Tuning)
- **Estimated Effort:** Low.

### 3. Comprehensive Logging & Observability
- **Level:** High
- **Description:** NestJS default logger is used. For production, a centralized logging mechanism (like Winston or Pino) paired with Datadog/NewRelic is missing.
- **Risk:** Difficulty in debugging production issues and tracking down user lifecycle anomalies.
- **Recommended Phase:** Pre-Launch
- **Estimated Effort:** Medium.

### 4. Compromised Token Blacklisting
- **Level:** Future Enhancement
- **Description:** Implement a Redis-based blacklist for compromised access tokens if immediate revocation (before the 15m expiration) is required.
- **Risk:** Low, since access tokens expire quickly and refresh tokens can be invalidated via the DB.
- **Recommended Phase:** Post-Launch / Enterprise Features
- **Estimated Effort:** High.

### 5. Type Safety in Dashboard Activity Providers
- **Level:** Medium
- **Description:** Some activity providers (e.g. `quiz-activity.provider.ts`) use implicit `any` assignments which triggers `@typescript-eslint/no-unsafe-argument`.
- **Risk:** Medium, as data payloads from Mongoose models might lose type safety if schemas change.
- **Recommended Phase:** Phase 6 (Global Refactor Pass)
- **Estimated Effort:** Low (requires adding specific typing interfaces to the provider mapping functions).

### 6. Redis Caching for Dashboard Aggregation
- **Level:** Future Enhancement
- **Description:** Implement Redis caching for the `GET /dashboard` endpoint to serve cached responses for `cacheTtl` seconds instead of querying the DB on every refresh.
- **Risk:** Low, standard performance optimization.
- **Recommended Phase:** Beta Launch Readiness (Task 9)
- **Estimated Effort:** Medium (requires setting up CacheModule and Redis).
