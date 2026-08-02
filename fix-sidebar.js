const fs = require('fs');
let code = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf8');

// Replace the imports and consts
const startIdx = code.indexOf('import { \n  LayoutDashboard,');
const endIdx = code.indexOf('interface SidebarProps {');

const replacement = `import { SIDEBAR_ITEMS, BOTTOM_SIDEBAR_ITEMS } from "@/config/navigation"\nimport { LogOut } from "lucide-react"\n\n`;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);

fs.writeFileSync('src/components/layout/sidebar.tsx', code);
