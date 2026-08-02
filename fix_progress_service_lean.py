with open('backend/src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

content = content.replace("}).exec();", "}).lean().exec();")

with open('backend/src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
