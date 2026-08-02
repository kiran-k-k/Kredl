with open('backend/src/modules/progress/progress-calculation.service.ts', 'r') as f:
    content = f.read()

content = content.replace(
"""  async recalculatePercentage(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    totalLessons: number,
  ) {
    const progress = await this.progressModel.findOne({ userId, courseId });
    if (!progress) return;

    const completed = progress.completedLessons.length;
    const percentage = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;""",
"""  async recalculatePercentage(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    totalLessons: number,
  ) {
    const progress = await this.progressModel.findOne({ userId, courseId });
    if (!progress) return;
    if (!progress.isDirty) return; // Optimization: only recalculate if dirty

    const completed = progress.completedLessons.length;
    const percentage = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;"""
)

with open('backend/src/modules/progress/progress-calculation.service.ts', 'w') as f:
    f.write(content)
