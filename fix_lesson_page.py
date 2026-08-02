with open('src/app/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx', 'r') as f:
    content = f.read()

# Add courseId prop
content = content.replace("<MarkCompleteButton", "<MarkCompleteButton\n            courseId={resolvedParams.courseId}")

with open('src/app/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx', 'w') as f:
    f.write(content)
