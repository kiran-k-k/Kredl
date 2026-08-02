import re

with open('src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

old_func = """  async calculateModuleAccess(
    courseId: string,
    userId: string,
    moduleId: string,
    lessons: any[] = []
  ): Promise<any> {
    return this.progressCalculationService.calculateModuleAccess(courseId, userId, moduleId, lessons);
  }"""

new_func = """  async calculateModuleAccess(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    modules: any[],
    lessons: any[]
  ): Promise<any> {
    return this.progressCalculationService.calculateModuleAccess(userId, courseId, modules, lessons);
  }"""

if old_func in content:
    content = content.replace(old_func, new_func)
else:
    # Try generic replace
    content = re.sub(r'  async calculateModuleAccess\([\s\S]*?\)\s*:\s*Promise<any>\s*\{[\s\S]*?\}', new_func, content)

with open('src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
