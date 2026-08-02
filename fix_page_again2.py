with open('src/app/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("courseId={data.course.id}", "courseId={response.course.id}")

with open('src/app/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx', 'w') as f:
    f.write(content)
