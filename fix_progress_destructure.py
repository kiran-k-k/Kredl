with open('src/components/ui/progress.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""  value,
  ...props
  indicatorClassName?: string
}: ProgressPrimitive.Root.Props & { indicatorClassName?: string }) {""",
"""  value,
  indicatorClassName,
  ...props
}: ProgressPrimitive.Root.Props & { indicatorClassName?: string }) {"""
)

with open('src/components/ui/progress.tsx', 'w') as f:
    f.write(content)
