with open('src/components/course/MarkCompleteButton.tsx', 'r') as f:
    content = f.read()

if 'useToast' not in content:
    content = content.replace("import { CheckCircle2, Loader2, Award } from 'lucide-react';", "import { CheckCircle2, Loader2, Award } from 'lucide-react';\nimport { useToast } from '@/components/ui/use-toast';")
    content = content.replace("const { mutate: complete, isPending } = useMarkLessonComplete();", "const { mutate: complete, isPending } = useMarkLessonComplete();\n  const { toast } = useToast();")
    
    content = content.replace("onSuccess: () => onComplete?.(),", "onSuccess: () => onComplete?.(),\n        onError: (error) => {\n          toast({\n            title: 'Error',\n            description: error.message || 'Failed to mark lesson complete',\n            variant: 'destructive',\n          });\n        },")

with open('src/components/course/MarkCompleteButton.tsx', 'w') as f:
    f.write(content)
