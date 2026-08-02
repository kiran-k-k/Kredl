const fs = require('fs');

const files = [
  'src/app/dashboard/settings/page.tsx',
  'src/app/dashboard/courses/page.tsx',
  'src/app/dashboard/bookmarks/page.tsx',
  'src/app/dashboard/profile/page.tsx',
  'src/app/dashboard/notifications/page.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { StudentLayout } from "@\/components\/layout\/student-layout"\n/, '');
  content = content.replace(/<StudentLayout>/g, '<>');
  content = content.replace(/<\/StudentLayout>/g, '</>');
  fs.writeFileSync(file, content);
}
