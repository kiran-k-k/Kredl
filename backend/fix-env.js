const fs = require('fs');
let code = fs.readFileSync('test/auth-matrix.e2e-spec.ts', 'utf8');

code = code.replace(
  "    process.env.MONGODB_URI = uri;\n    process.env.DATABASE_NAME = 'kredl_matrix_test';",
  "    process.env.MONGODB_URI = uri;\n    process.env.DATABASE_NAME = 'kredl_matrix_test';\n    process.env.JWT_SECRET = 'test-secret';\n    process.env.JWT_REFRESH_SECRET = 'refresh-secret';"
);

fs.writeFileSync('test/auth-matrix.e2e-spec.ts', code);
