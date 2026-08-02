import re

# Fix progress.service.ts
with open('src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

content = content.replace(
'''  async calculateModuleAccess(
    courseId: string,
    userId: string,
    moduleId: string,
  ): Promise<any> {
    return this.progressCalculationService.calculateModuleAccess(courseId, userId, moduleId);
  }''',
'''  async calculateModuleAccess(
    courseId: string,
    userId: string,
    moduleId: string,
    lessons: any[] = []
  ): Promise<any> {
    return this.progressCalculationService.calculateModuleAccess(courseId, userId, moduleId, lessons);
  }'''
)
with open('src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)

# Fix dashboard.service.ts
with open('src/modules/dashboard/dashboard.service.ts', 'r') as f:
    content = f.read()

content = content.replace('let currentModule = null;', 'let currentModule: any = null;')
content = content.replace('type: (nextLesson as any).type as LessonType,', '')
with open('src/modules/dashboard/dashboard.service.ts', 'w') as f:
    f.write(content)

