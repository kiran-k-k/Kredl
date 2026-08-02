# Authentication API Documentation

This document describes the API endpoints provided by the Kredl Authentication Module.

## Summary

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh JWT Token | Yes (Refresh Cookie) |
| POST | `/api/v1/auth/logout` | Logout user (clear cookies) | Yes (JWT) |
| GET | `/api/v1/auth/google` | Google OAuth Initialization | No |
| GET | `/api/v1/auth/google/callback` | Google OAuth Callback | No |

---

## 1. Register User

**Endpoint:** `POST /api/v1/auth/register`

Creates a new user account with a local email and password. Generates an email verification token.

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "STUDENT"
  }'
```

### Request JSON
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "STUDENT" // Optional, default is based on business logic
}
```

### Response JSON (201 Created)
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

### Error Responses
- **400 Bad Request:** Validation failed (e.g. weak password).
- **409 Conflict:** Email already exists.

---

## 2. Login User

**Endpoint:** `POST /api/v1/auth/login`

Authenticates a user and returns a short-lived JWT. The refresh token is attached as an `HttpOnly` cookie.

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'
```

### Request JSON
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

### Response JSON (200 OK)
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "60d5ecb8b392d700153f3a2c",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "status": "ACTIVE"
  }
}
```

### Error Responses
- **401 Unauthorized:** Invalid credentials.
- **403 Forbidden:** Account locked or suspended.

---

## 3. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

Uses the `HttpOnly` refresh token cookie to obtain a new access token and rotate the refresh token.

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Cookie: refreshToken=your-refresh-token-here"
```

### Request JSON
None (relies on cookies).

### Response JSON (200 OK)
```json
{
  "accessToken": "eyJhbGciOi..."
}
```

### Error Responses
- **401 Unauthorized:** Refresh token missing or invalid.

---

## 4. Logout User

**Endpoint:** `POST /api/v1/auth/logout`

Invalidates the refresh token on the server and clears the HTTP-only cookie.

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Request JSON
None.

### Response JSON (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

### Error Responses
- **401 Unauthorized:** Access token invalid.
