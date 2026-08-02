with open('src/components/student/dynamic-continue-learning-card.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useContinueLearning } from '@/hooks/useContinueLearning';", "import { useContinueLearningData } from '@/hooks/useProgress';")
content = content.replace("const { data, isLoading, isError } = useContinueLearning();", "const { data, isLoading, isError } = useContinueLearningData();")

with open('src/components/student/dynamic-continue-learning-card.tsx', 'w') as f:
    f.write(content)
