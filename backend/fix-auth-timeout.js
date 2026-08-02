const fs = require('fs');
let code = fs.readFileSync('test/auth.e2e-spec.ts', 'utf8');

if (!code.includes('jest.setTimeout(30000);')) {
    code = code.replace(
        "describe('AuthController (e2e)', () => {",
        "jest.setTimeout(30000);\n\ndescribe('AuthController (e2e)', () => {"
    );
    fs.writeFileSync('test/auth.e2e-spec.ts', code);
}
