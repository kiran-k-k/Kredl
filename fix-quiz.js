const fs = require('fs');
let code = fs.readFileSync('src/app/courses/[courseId]/module/[moduleId]/quiz/result/page.tsx', 'utf8');

code = code.replace(
  'import { StudentLayout } from "@/components/layout/student-layout"',
  'import { DashboardLayout } from "@/components/layout/dashboard-layout"'
);
code = code.replace(/<StudentLayout>/g, '<DashboardLayout>');
code = code.replace(/<\/StudentLayout>/g, '</DashboardLayout>');

fs.writeFileSync('src/app/courses/[courseId]/module/[moduleId]/quiz/result/page.tsx', code);
