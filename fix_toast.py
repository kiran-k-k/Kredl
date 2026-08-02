with open('src/components/course/MarkCompleteButton.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useToast } from '@/components/ui/use-toast';", "import { toast } from 'sonner';")
content = content.replace("const { toast } = useToast();\n", "")
content = content.replace("toast({\n            title: 'Error',\n            description: error.message || 'Failed to mark lesson complete',\n            variant: 'destructive',\n          });", "toast.error(error.message || 'Failed to mark lesson complete');")

with open('src/components/course/MarkCompleteButton.tsx', 'w') as f:
    f.write(content)
