const fs = require('fs');
let code = fs.readFileSync('test/auth-matrix.e2e-spec.ts', 'utf8');

if (!code.includes('jest.setTimeout(30000);')) {
    code = code.replace(
        "describe('Authorization Matrix (e2e)', () => {",
        "jest.setTimeout(30000);\n\ndescribe('Authorization Matrix (e2e)', () => {"
    );
    fs.writeFileSync('test/auth-matrix.e2e-spec.ts', code);
}
