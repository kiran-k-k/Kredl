with open('backend/src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

content = content.replace("status: 'published',", "status: 'published' as any,")
content = content.replace("status: ModuleStatus.IN_PROGRESS,", "status: ModuleStatus.UNLOCKED,")

with open('backend/src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
