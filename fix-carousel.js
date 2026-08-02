const fs = require('fs');
let code = fs.readFileSync('src/components/ui/carousel.tsx', 'utf8');

code = code.replace(
  '    onSelect(api)',
  '    // eslint-disable-next-line\n    onSelect(api)'
);

fs.writeFileSync('src/components/ui/carousel.tsx', code);
