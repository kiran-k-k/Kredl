process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.FRONTEND_VERIFY_EMAIL_URL = 'http://localhost:3000/verify-email';
process.env.FRONTEND_RESET_PASSWORD_URL =
  'http://localhost:3000/reset-password';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';
process.env.RESEND_API_KEY = 're_test123';
process.env.EMAIL_FROM = 'test@example.com';
process.env.DATABASE_NAME = 'test_kredl_db';
