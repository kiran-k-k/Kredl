# Authentication Security Architecture

Kredl implements a rigorous, production-grade security architecture for the authentication module based on OWASP Top 10 guidelines.

## 1. Token Management
- **Access Tokens (JWT):** Short-lived (e.g., 15 minutes). Never stored in the database. Sent via `Authorization: Bearer` header.
- **Refresh Tokens:** Long-lived (e.g., 7 days). **Hashed using bcrypt** before being stored in the database (`hashedRefreshToken`). Sent exclusively via secure, `HttpOnly`, `SameSite=Strict` cookies.
- **Token Rotation:** Every time a refresh token is used, it is rotated. A new access token and a new refresh token are issued. 
- **Compromise Mitigation:** If a reused/compromised refresh token is detected (if implemented), or if a user logs out, the hashed token in the DB is nullified.

## 2. Password Security
- Passwords are never stored in plaintext.
- Hashed using **bcrypt** with a secure cost factor (e.g., 10+).
- Verified using constant-time comparison to prevent timing attacks.

## 3. Account Lockout & Brute Force Prevention
- **Rate Limiting:** Global rate limiters are applied via `@nestjs/throttler` to prevent brute force attacks on `/login` and `/register`.
- **Account Lockout:** After a configurable number of failed attempts (e.g., 5), the account is locked (`status: LOCKED`) for a specific duration (`lockedUntil`), preventing further login attempts even with correct credentials.

## 4. Cross-Site Scripting (XSS) & Cross-Site Request Forgery (CSRF)
- **Helmet:** Used to enforce strict HTTP headers (CSP, X-Frame-Options, X-XSS-Protection).
- **HttpOnly Cookies:** Ensure JavaScript cannot access the refresh token, eliminating XSS extraction risk for the long-lived token.
- **CORS:** Configured strictly to only allow requests from the designated frontend URL.

## 5. Input Validation & Injection Prevention
- **DTO Validation:** All requests are validated strictly using `class-validator`. Unrecognized fields are stripped using `whitelist: true`.
- **NoSQL Injection:** Mongoose strict schemas and sanitization prevent malicious MongoDB query operators from being executed.

## 6. Secrets Management
- All secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_SECRET`) are managed via environment variables.
- Secrets are never hardcoded or logged.

## 7. Role-Based Access Control (RBAC)
- All protected routes require a valid JWT via `JwtAuthGuard`.
- Role constraints are enforced at the controller/method level via `RolesGuard`, querying the user's role mapping to ensure they possess the requisite authorization.
