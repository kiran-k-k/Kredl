export const SECURITY_CONFIG = {
  // Password Policy
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 64,
    SALT_ROUNDS: 10,
  },

  // Rate Limiting
  THROTTLER: {
    DEFAULT: {
      TTL: 60000, // 1 minute
      LIMIT: 1000, // 1000 requests per minute to prevent React Query refetch loops from hitting limits
    },
    AUTH: {
      TTL: 60000, // 1 minute
      LIMIT: 5, // 5 requests per minute for auth endpoints
    },
    LESSONS: {
      TTL: 60000, // 1 minute
      LIMIT: 1000, // 1000 requests per minute for lessons
    },
  },

  // Account Protection
  ACCOUNT_LOCKOUT: {
    MAX_FAILED_ATTEMPTS: 5,
    DURATION_MS: 15 * 60 * 1000, // 15 minutes
  },

  // Token Expirations
  TOKENS: {
    EMAIL_VERIFICATION_HOURS: 24,
    PASSWORD_RESET_HOURS: 1,
    DEFAULT_JWT_EXPIRATION: '15m',
    DEFAULT_REFRESH_EXPIRATION: '7d',
  },

  // Cookies
  COOKIES: {
    REFRESH_TOKEN: 'refresh_token',
  },

  // Quiz Policy Defaults
  QUIZ: {
    DEFAULT_MAX_ATTEMPTS: Number(process.env.QUIZ_MAX_ATTEMPTS) || 3,
    DEFAULT_COOLDOWN_HOURS: Number(process.env.QUIZ_COOLDOWN_HOURS) || 24,
  },
};
