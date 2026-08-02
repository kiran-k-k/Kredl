const fs = require('fs');
let code = fs.readFileSync('src/components/layout/student-layout.tsx', 'utf8');
code = code.replace(
  /const NavContent = \(\) => \(/g,
  'const navContent = (\n'
);
code = code.replace(
  /    <\/div>\n  \)\n\n  return \(/g,
  '    </div>\n  )\n\n  return ('
);
code = code.replace(/<NavContent \/>/g, '{navContent}');
fs.writeFileSync('src/components/layout/student-layout.tsx', code);
