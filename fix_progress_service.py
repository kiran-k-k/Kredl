import re

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

# Insert evaluateModuleCompletion after trackViewedLesson
track_viewed_pattern = r"(async trackViewedLesson\([\s\S]*?\}\n\s*\}\,\n\s*\{ upsert: true \}\,\n\s*\)\;\n\s*\})"
content = re.sub(track_viewed_pattern, r"\1\n\n" + evaluate_func, content)

# Modify markLessonComplete
mark_complete_pattern = r"(async markLessonComplete\(\n\s*userId: Types.ObjectId,\n\s*courseId: Types.ObjectId,\n\s*lessonId: Types.ObjectId,\n\s*\): Promise<void> \{)"
mark_complete_repl = r"""\1
    const lesson = await this.lessonModel.findById(lessonId).exec();
    if (!lesson) return;
"""
content = re.sub(mark_complete_pattern, mark_complete_repl, content)

# Modify markLessonComplete call evaluateModuleCompletion
content = content.replace(
"""      { upsert: true },
    );
    
    const totalLessons = await this.lessonModel.countDocuments({""",
"""      { upsert: true },
    );
    
    await this.evaluateModuleCompletion(userId, courseId, lesson.moduleId);
    
    const totalLessons = await this.lessonModel.countDocuments({"""
)

# Modify markLessonIncomplete
mark_incomplete_pattern = r"(async markLessonIncomplete\(\n\s*userId: Types.ObjectId,\n\s*courseId: Types.ObjectId,\n\s*lessonId: Types.ObjectId,\n\s*\): Promise<void> \{)"
mark_incomplete_repl = r"""\1
    const lesson = await this.lessonModel.findById(lessonId).exec();
    if (!lesson) return;
"""
content = re.sub(mark_incomplete_pattern, mark_incomplete_repl, content)

# Modify markLessonIncomplete call evaluateModuleCompletion
content = content.replace(
"""      }
    );
    
    const totalLessons = await this.lessonModel.countDocuments({""",
"""      }
    );
    
    await this.evaluateModuleCompletion(userId, courseId, lesson.moduleId);
    
    const totalLessons = await this.lessonModel.countDocuments({"""
)


with open('backend/src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
