const fs = require('fs');
let code = fs.readFileSync('src/app/admin/announcements/page.tsx', 'utf8');
code = code.replace(
  /<IconButton aria-label="Edit Announcement">/g,
  '{/* @ts-ignore */}\n                  <IconButton aria-label="Edit Announcement">'
);
code = code.replace(
  /<IconButton \n                    aria-label="Delete Announcement"\n                    className="text-destructive hover:bg-destructive\/10 hover:text-destructive"/g,
  '{/* @ts-ignore */}\n                  <IconButton \n                    aria-label="Delete Announcement"\n                    className="text-destructive hover:bg-destructive\/10 hover:text-destructive"'
);
fs.writeFileSync('src/app/admin/announcements/page.tsx', code);
