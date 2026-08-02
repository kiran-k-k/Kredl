const fs = require('fs');
let code = fs.readFileSync('src/components/layout/tpo-layout.tsx', 'utf8');

// Replace inline component declaration
code = code.replace(
  /const SidebarContent = \(\) => \(/g,
  'const sidebarContent = (\n'
);
code = code.replace(
  /    <\/div>\n  \)\n\n  return \(/g,
  '    </div>\n  )\n\n  return ('
);
// Replace <SidebarContent /> with {sidebarContent}
code = code.replace(/<SidebarContent \/>/g, '{sidebarContent}');

fs.writeFileSync('src/components/layout/tpo-layout.tsx', code);
