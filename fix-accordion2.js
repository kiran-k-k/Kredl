const fs = require('fs');
let code = fs.readFileSync('src/app/learn/[courseId]/[lessonId]/page.tsx', 'utf8');

code = code.replace(
  '<Accordion type="single" defaultValue="module-1" className="w-full">',
  '<Accordion type="multiple" defaultValue={["module-1"]} className="w-full">'
);
fs.writeFileSync('src/app/learn/[courseId]/[lessonId]/page.tsx', code);
