const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  'reject: (reason?: any) => void }',
  'reject: (reason?: unknown) => void }'
);

code = code.replace(
  'const processQueue = (error: any,',
  'const processQueue = (error: unknown,'
);

fs.writeFileSync('src/lib/api.ts', code);
