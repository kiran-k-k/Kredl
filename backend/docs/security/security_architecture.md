# Kredl Security Architecture

This document outlines the security mechanisms implemented in the Kredl Backend (NestJS).

## 1. Authentication & Session Management
- **JWT Authentication:** Short-lived access tokens (15m) are issued for API access.
- **Refresh Tokens:** Long-lived refresh tokens (7d) are securely hashed and stored in the database. They are transmitted to the client via `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS and CSRF attacks.
- **Token Rotation:** On every refresh request, the old refresh token is invalidated, and a new one is issued.
- **Token Versioning:** The `User` schema contains a `tokenVersion` field. Changing passwords increments this version, immediately revoking all issued tokens (both access and refresh).

## 2. Account Protection & Lockout
- **Rate Limiting (Throttler):**
  - Default: 100 requests per minute per IP.
  - Auth Endpoints: 5 requests per minute per IP.
- **Account Lockout:** After 5 failed login attempts, the account is temporarily locked for 15 minutes. The frontend receives a specialized `AccountLockedException`.
- **Brute Force Mitigation:** The combination of strict rate limiting and account lockout effectively mitigates brute-force credential stuffing.

## 3. Data Sanitization & Network Security
- **NoSQL Injection Prevention:** `express-mongo-sanitize` is implemented globally to strip out keys containing `$` or `.` from request body, query, and params.
- **Helmet Headers:** Sets strict HTTP headers including Content Security Policy (CSP), HSTS, and X-XSS-Protection.
- **CORS:** Cross-Origin Resource Sharing is strictly configured to only allow requests from the designated `FRONTEND_URL` environment variable, ensuring malicious domains cannot interact with the API via the browser.

## 4. Environment & Secrets Management
- **Strict Validation:** The application will fail to start if critical environment variables (like `JWT_SECRET`, `FRONTEND_URL`, `RESEND_API_KEY`) are missing, preventing insecure defaults in production.
- **Centralized Configuration:** Magic numbers and policies are managed centrally in `src/config/security.config.ts`.

## 5. Password Policy
- Passwords must be between 8 and 64 characters.
- Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
- Hashing is done using bcrypt with appropriate work factors via `PasswordService`.

## 6. Audit & Logging
- **Security Logger Interceptor:** Automatically logs all HTTP requests including method, URL, status code, IP address, user-agent, and latency, without logging sensitive payloads (like passwords or tokens).

## 7. Security Health Checks
- The `/api/health/security` endpoint provides monitoring systems a quick status on the active security middleware (Helmet, CORS, RateLimiter).
