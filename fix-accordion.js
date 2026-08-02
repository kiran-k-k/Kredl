const fs = require('fs');
let code = fs.readFileSync('src/app/learn/[courseId]/[lessonId]/page.tsx', 'utf8');

// The shadcn accordion needs type="single" if default value is string
// or defaultValue={["module-1"]} if type="multiple"
if (code.includes('<Accordion defaultValue="module-1" className="w-full">')) {
  code = code.replace(
    '<Accordion defaultValue="module-1" className="w-full">',
    '<Accordion type="single" defaultValue="module-1" className="w-full">'
  );
}

fs.writeFileSync('src/app/learn/[courseId]/[lessonId]/page.tsx', code);
