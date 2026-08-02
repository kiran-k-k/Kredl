# Folder Structure

The Kredl backend uses a modular folder structure conforming to NestJS best practices.

```
src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root application module
├── config/                     # Centralized configuration (e.g. database, app, jwt)
├── core/                       # Core global utilities
│   ├── filters/                # Global exception filters
│   ├── interceptors/           # Global interceptors
│   ├── pipes/                  # Global validation pipes
│   └── decorators/             # Custom decorators
├── modules/                    # Feature modules (Domain-Driven Design)
│   ├── auth/                   # Authentication & Authorization (Guards, Strategies, Services)
│   ├── users/                  # User management & Profiles
│   ├── roles/                  # Role & Permission management
│   ├── mail/                   # Email notification service
│   ├── database-health/        # DB status and analytics
│   ├── lessons/                # Course & Lesson management
│   ├── progress/               # Progress tracking logic
│   └── dashboard/              # Student Dashboard API
│       ├── providers/          # Sub-providers (e.g., activity providers)
│       ├── dto/                # Data Transfer Objects
│       └── dashboard-facade.service.ts # Cross-module Aggregation Layer
└── test/                       # End-to-end (e2e) tests
```

### Conventions
- Each module has its own `controllers`, `services`, `schemas`, and `dto` subfolders.
- Business logic is encapsulated strictly within `*.service.ts`.
- Mongoose schemas are placed in `schemas/`.
- Interfaces and type definitions are localized within the respective module where possible.
