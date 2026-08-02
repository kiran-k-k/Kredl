with open('src/components/course/MarkCompleteButton.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useCompleteLesson } from '@/hooks/useCompleteLesson';", "import { useMarkLessonComplete } from '@/hooks/useProgress';")
content = content.replace("const { mutate: complete, isPending } = useCompleteLesson();", "const { mutate: complete, isPending } = useMarkLessonComplete();")
# The useCompleteLesson previously took just lessonId. Now it takes { lessonId, courseId }.
# Wait, let's see how `complete` is called in MarkCompleteButton.tsx

with open('src/components/course/MarkCompleteButton.tsx', 'w') as f:
    f.write(content)
