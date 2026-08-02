with open('src/components/course/MarkCompleteButton.tsx', 'r') as f:
    content = f.read()

content = content.replace("lessonId: string;", "lessonId: string;\n  courseId: string;")
content = content.replace("  lessonId,", "  lessonId,\n  courseId,")
content = content.replace("complete(lessonId,", "complete({ lessonId, courseId },")

with open('src/components/course/MarkCompleteButton.tsx', 'w') as f:
    f.write(content)
