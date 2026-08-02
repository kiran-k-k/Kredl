import os

for root, dirs, files in os.walk('src/app/admin'):
    for file in files:
        if file == 'page.tsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Revert bad sed
            content = content.replace('{* @ts-expect-error Base UI IconButton types do not include children *}\n          ', '')
            content = content.replace('{* @ts-expect-error Base UI IconButton types do not include children *}\n', '')
            
            # Remove double expects
            import re
            content = re.sub(r'\{\/\* @ts-expect-error.*?\*\/\}\n\s*\{\/\* @ts-expect-error.*?\*\/\}', '{/* @ts-expect-error Base UI IconButton types do not include children */}', content)
            
            lines = content.split('\n')
            new_lines = []
            for i in range(len(lines)):
                if '<IconButton' in lines[i] and not lines[i].strip().startswith('//') and not lines[i].strip().startswith('/*'):
                    if i == 0 or '@ts-expect-error' not in new_lines[-1]:
                        whitespace = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
                        new_lines.append(whitespace + '{/* @ts-expect-error Base UI IconButton types do not include children */}')
                new_lines.append(lines[i])
                
            with open(filepath, 'w') as f:
                f.write('\n'.join(new_lines))
