with open('src/components/ui/progress.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '}: ProgressPrimitive.Root.Props) {',
    '  indicatorClassName?: string\n}: ProgressPrimitive.Root.Props & { indicatorClassName?: string }) {'
)
content = content.replace(
    '<ProgressIndicator />',
    '<ProgressIndicator className={indicatorClassName} />'
)

with open('src/components/ui/progress.tsx', 'w') as f:
    f.write(content)
