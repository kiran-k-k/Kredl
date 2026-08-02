const fs = require('fs');
let code = fs.readFileSync('src/modules/auth/strategies/jwt.strategy.ts', 'utf8');

code = code.replace(
  "    const user = await this.usersService.findById(payload.sub);\n    console.log('JWT STRATEGY VALIDATE', payload, !!user);",
  "    const user = await this.usersService.findById(payload.sub);"
);
code = code.replace(
  "    if (!user) {\n      console.log('User not found in DB', payload.sub);",
  "    if (!user) {"
);
code = code.replace(
  "      console.log('Token mismatch:', user.tokenVersion, payload.tokenVersion);\n      throw new TokenVersionMismatchException();",
  "      throw new TokenVersionMismatchException();"
);

fs.writeFileSync('src/modules/auth/strategies/jwt.strategy.ts', code);
