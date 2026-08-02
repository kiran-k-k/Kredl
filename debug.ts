import fs from 'fs';
const content = fs.readFileSync('src/app/admin/courses/courses.test.tsx', 'utf-8');
const newContent = content.replace(
  '    if (form) {',
  '    console.log("Form found:", !!form, "Button tag:", submitBtn.tagName);\n    if (form) {'
);
fs.writeFileSync('src/app/admin/courses/courses.test.tsx', newContent);
