# AI Development Rules for Kredl

When developing for Kredl, AI agents must adhere to the following rules:

## 1. Architectural Integrity
- Do not introduce breaking changes to the existing architecture.
- Follow the established **Modular Monolith** pattern.
- Do not bypass `Services` to interact directly with the database from `Controllers`.

## 2. Refactoring Boundaries
- If modifying an existing feature, do not rewrite the entire feature unless explicitly instructed or if it addresses a critical security vulnerability.
- Maintain existing local authentication, Google OAuth, and JWT strategies. Extend, do not replace.

## 3. Testing Mandates
- Every new feature or fix must include corresponding unit tests.
- E2E tests must be updated if API boundaries change.
- Never write tests just to pass; tests must meaningfully cover domain logic, edge cases, and failure states.

## 4. Documentation
- Update `api/` documentation if routes change.
- Keep `technical-debt.md` updated with any shortcuts taken or future optimizations identified during implementation.
