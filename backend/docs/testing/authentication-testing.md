# Authentication Testing Strategy

Kredl implements comprehensive production-grade testing for the authentication module.

## 1. Test Coverage Goals
- **Authentication Services:** ≥ 95%
- **Authentication Controllers:** ≥ 90%
- **JWT Guards:** 100%
- **Roles Guards:** 100%
- **Utility Services:** ≥ 95%
- **Overall Auth Module:** ≥ 90%

## 2. Unit Testing Strategy
- **Frameworks:** Jest and standard NestJS `TestingModule`.
- **Mocking:** External dependencies (Mongoose models, Mail service/Resend, Google OAuth client, ConfigService, EventEmitter) are mocked comprehensively.
- **Scope:** Every branch of logic in `AuthService` (e.g. invalid password, account locked, account suspended, unverified email) is explicitly tested.

## 3. Integration & E2E Testing Strategy
- **Frameworks:** Jest, Supertest.
- **Database Isolation:** Uses `mongodb-memory-server` to spin up an isolated, ephemeral in-memory MongoDB instance per test suite. This ensures deterministic tests without impacting local or staging databases.
- **RBAC Matrix Testing:** End-to-end tests rigorously evaluate a matrix of roles (Student, Admin, TPO, Guest) against protected endpoints to ensure unauthorized access is blocked (403 Forbidden or 401 Unauthorized) and authorized access is permitted (200 OK).

## 4. Security Tests
Explicit tests exist to verify:
- Passwords are not returned in payloads.
- Refresh tokens are checked correctly.
- Failed logins increment attempt counters.
- Lockout periods are enforced.
