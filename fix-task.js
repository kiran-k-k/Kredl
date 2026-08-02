const fs = require('fs');
let code = fs.readFileSync('.gemini/antigravity/brain/a297322d-f591-43b6-8aed-623ba0c6ca1c/task.md', 'utf8');

code = code.replace(
  "- [x] Check `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, etc.port",
  "- [x] Check `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, etc.\n- [ ] **6. Final Deliverables**\n  - [ ] Generate Comprehensive Final Report"
);

fs.writeFileSync('.gemini/antigravity/brain/a297322d-f591-43b6-8aed-623ba0c6ca1c/task.md', code);
