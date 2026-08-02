# Kredl Architecture

## Overview
The Kredl backend uses a **Modular Monolith Architecture** adhering strictly to **Domain-Driven Design (DDD)**. 

### Core Principles
- **Dependency Direction:** Dependencies flow inwards toward domain entities.
- **Module Isolation:** Modules (Auth, Users, Courses, Placements) communicate through strictly defined interfaces and services, minimizing cross-module coupling.
- **No Circular Dependencies:** Checked by NestJS dependency resolution and linter.
- **Shared Package Usage:** Shared utilities (e.g., mail, database-health) are placed in global/core modules.
- **Config Centralization:** All configuration is managed centrally via `@nestjs/config` and strictly validated at startup.
- **DTO Validation:** Data Transfer Objects enforce input sanitization and validation using `class-validator` and `class-transformer`.
- **Exception Handling:** Global exception filters catch and format all errors consistently.
- **Logging:** Centralized structured logging.
- **Dependency Injection:** Leverages the NestJS IoC container.

## Architecture Layers

1. **Controllers (Presentation):** Handle incoming HTTP requests, route to appropriate services, and return responses.
2. **Facade Services (Aggregation):** Compose data across multiple domain services. These services strictly contain orchestration logic, utilizing `Promise.all()` to prevent performance bottlenecks, and do not contain pure business logic themselves.
3. **Services (Application logic):** Orchestrate business logic and domain rules.
4. **Schemas/Repositories (Data Access):** Mongoose schemas manage MongoDB persistence.

This architecture ensures scalability, testability, and clear separation of concerns.
