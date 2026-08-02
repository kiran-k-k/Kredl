const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the import of StudentLayout
content = content.replace(/import { StudentLayout } from "@\/components\/layout\/student-layout"\n/, '');

// Replace <StudentLayout> wrapper with Fragment
content = content.replace(/<StudentLayout>/g, '<>');
content = content.replace(/<\/StudentLayout>/g, '</>');

fs.writeFileSync(file, content);
