import re

with open('src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

# Replace this.recalculatePercentage
content = content.replace('this.recalculatePercentage', 'this.progressCalculationService.recalculatePercentage')

# Remove recalculatePercentage
content = re.sub(r'  async recalculatePercentage\(.*?\)\s*{.*?^  }\n\n' , '', content, flags=re.DOTALL | re.MULTILINE)

# Remove calculateModuleAccess
content = re.sub(r'  async calculateModuleAccess\(.*?\)\s*:\s*Promise<.*?>\s*{.*?^  }\n\n' , '', content, flags=re.DOTALL | re.MULTILINE)

# Remove getContinueLearning
content = re.sub(r'  async getContinueLearning\(.*?\)\s*:\s*Promise<.*?>\s*{.*?^  }\n\n' , '', content, flags=re.DOTALL | re.MULTILINE)

# Remove getProgressSummary
content = re.sub(r'  async getProgressSummary\(.*?\)\s*:\s*Promise<.*?>\s*{.*?^  }\n\n' , '', content, flags=re.DOTALL | re.MULTILINE)

# Remove getCourseProgressDetails
content = re.sub(r'  async getCourseProgressDetails\(.*?\)\s*:\s*Promise<.*?>\s*{.*?^  }\n\n' , '', content, flags=re.DOTALL | re.MULTILINE)

with open('src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
