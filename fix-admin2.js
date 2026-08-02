const fs = require('fs');
let code = fs.readFileSync('src/app/admin/announcements/page.tsx', 'utf8');

// Replace both IconButtons
code = code.replace(/<IconButton aria-label="Edit Announcement">/g, '{/* @ts-expect-error */}\n                  <IconButton aria-label="Edit Announcement">');
code = code.replace(/<IconButton \n                    aria-label="Delete Announcement"/g, '{/* @ts-expect-error */}\n                  <IconButton \n                    aria-label="Delete Announcement"');

fs.writeFileSync('src/app/admin/announcements/page.tsx', code);
