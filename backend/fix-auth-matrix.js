const fs = require('fs');
let code = fs.readFileSync('test/auth-matrix.e2e-spec.ts', 'utf8');

// Insert imports
code = code.replace(
  "import request from 'supertest';",
  "import request from 'supertest';\nimport { MongoMemoryServer } from 'mongodb-memory-server';\nimport mongoose from 'mongoose';"
);

// Insert MongoMemoryServer logic
code = code.replace(
  "  const tokens: Record<string, string> = {};",
  "  const tokens: Record<string, string> = {};\n  let mongod: MongoMemoryServer;"
);

code = code.replace(
  "  beforeAll(async () => {",
  "  beforeAll(async () => {\n    mongod = await MongoMemoryServer.create();\n    const uri = mongod.getUri();\n    process.env.MONGODB_URI = uri;\n    process.env.DATABASE_NAME = 'kredl_matrix_test';"
);

code = code.replace(
  "  afterAll(async () => {\n    await app.close();\n  });",
  "  afterAll(async () => {\n    await mongoose.disconnect();\n    if (mongod) await mongod.stop();\n    if (app) await app.close();\n  });"
);

fs.writeFileSync('test/auth-matrix.e2e-spec.ts', code);
