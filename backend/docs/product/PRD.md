# Kredl Product Requirements Document (PRD)

## 1. Overview
**Kredl** is an AI-Assisted Career Learning & Placement Platform designed to bridge the gap between academic learning and industry placement. The platform serves three main user personas:
- **Students:** To learn, track progress, and apply for placements.
- **TPOs (Training and Placement Officers):** To manage campus placements, track student readiness, and coordinate with recruiters.
- **Admins:** To manage the overall platform, users, content, and system health.

## 2. Goals
- Deliver a production-grade, secure, and scalable SaaS platform.
- Ensure rigorous Role-Based Access Control (RBAC).
- Provide a responsive Next.js frontend and a highly modular NestJS backend.

## 3. Technology Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, Zustand.
- **Backend:** NestJS, TypeScript, MongoDB Atlas, Mongoose, Passport, JWT Authentication.
- **Architecture:** Modular Monolith, Domain-Driven Design (DDD), Clean Architecture, SOLID principles.

## 4. Key Features (Phase 1-4 completed)
- **Robust Authentication:** Local email/password and Google OAuth integration.
- **Role-Based Access Control:** Distinct roles and permissions (Student, Admin, TPO).
- **Security:** Helmet, CORS, Rate Limiting, NoSQL injection prevention, strict cookie policies.
- **Account Management:** Email verification, password reset, account lockouts on failed attempts.

## 5. Future Phases
- **Phase 5:** Student Dashboard
- **Future:** AI-assisted learning modules, Placement drive management, Analytics.
