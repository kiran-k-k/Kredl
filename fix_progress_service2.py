with open('backend/src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

evaluate_func = """  private async evaluateModuleCompletion(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    moduleId: Types.ObjectId,
  ): Promise<void> {
    const lessons = await this.lessonModel.find({
      moduleId,
      status: 'published',
      isDeleted: { $ne: true },
    }).exec();

    const progress = await this.progressModel.findOne({ userId, courseId }).exec();
    const completedLessonIds = new Set((progress?.completedLessons || []).map((id) => id.toString()));

    const allLessonsCompleted = lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l._id.toString()));

    const quiz = await this.quizModel.findOne({ moduleId, isPublished: true }).exec();

    if (allLessonsCompleted) {
      if (!quiz) {
        await this.moduleCompletionModel.updateOne(
          { userId, moduleId },
          {
            $set: {
              courseId,
              status: ModuleStatus.COMPLETED,
              completedAt: new Date(),
            },
          },
          { upsert: true }
        );
      } else {
        const completion = await this.moduleCompletionModel.findOne({ userId, moduleId }).exec();
        if (!completion || completion.status !== ModuleStatus.COMPLETED) {
          await this.moduleCompletionModel.updateOne(
            { userId, moduleId },
            {
              $set: {
                courseId,
                status: ModuleStatus.IN_PROGRESS,
              },
            },
            { upsert: true }
          );
        }
      }
    } else {
      await this.moduleCompletionModel.updateOne(
        { userId, moduleId },
        {
          $set: {
            status: ModuleStatus.IN_PROGRESS,
          },
        }
      );
    }
  }

"""

if 'private async evaluateModuleCompletion' not in content:
    content = content.replace('  async saveQuizScore(', evaluate_func + '  async saveQuizScore(')

with open('backend/src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
