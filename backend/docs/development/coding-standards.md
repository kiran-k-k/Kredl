# Kredl Coding Standards

## 1. TypeScript Strictness
- Strict mode is enabled in `tsconfig.json`.
- Implicit `any` is forbidden. Avoid explicit `any` unless interacting with untyped third-party legacy libraries.
- Leverage interfaces and types for all DTOs and database schemas.

## 2. NestJS Conventions
- **Dependency Injection:** Use constructor injection exclusively.
- **Controllers:** Controllers should be thin. They must only handle HTTP routing, extract payloads/params, pass them to services, and return the result.
- **Services:** All business logic resides in services.
- **Modules:** Group related features into a cohesive module. Every module should declare its imports, providers, controllers, and exports clearly.

## 3. Asynchronous Programming
- Use `async/await` exclusively instead of `.then()/.catch()`.
- Error handling should be managed via NestJS `HttpException` or custom exceptions that map to specific HTTP status codes.

## 4. Linting & Formatting
- Code is formatted using Prettier.
- ESLint enforces strict stylistic and correctness rules (e.g., unused variables, strict boolean expressions).

## 5. Naming Conventions
- **Classes/Interfaces:** PascalCase.
- **Variables/Methods:** camelCase.
- **Constants:** UPPER_SNAKE_CASE.
- **Files:** kebab-case, appended with the type (e.g., `user.controller.ts`, `auth.service.spec.ts`).
