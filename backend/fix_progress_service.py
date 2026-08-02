import re

with open('src/modules/progress/progress.service.ts', 'r') as f:
    content = f.read()

# Replace addCompletedLesson with markLessonComplete and markLessonIncomplete
old_add_lesson = r"""  async addCompletedLesson\(
    userId: Types\.ObjectId,
    courseId: Types\.ObjectId,
    lessonId: Types\.ObjectId,
  \) \{
    await this\.progressModel\.updateOne\(
      \{ userId, courseId \},
      \{ \$addToSet: \{ completedLessons: lessonId \} \},
      \{ upsert: true \},
    \);
  \}"""

new_lessons = """  async markLessonComplete(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<void> {
    await this.progressModel.updateOne(
      { userId, courseId },
      { 
        $addToSet: { completedLessons: lessonId },
        $set: { isDirty: true }
      },
      { upsert: true },
    );
    
    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }

  async markLessonIncomplete(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    lessonId: Types.ObjectId,
  ): Promise<void> {
    await this.progressModel.updateOne(
      { userId, courseId },
      { 
        $pull: { completedLessons: lessonId },
        $set: { isDirty: true }
      }
    );
    
    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }"""

content = re.sub(old_add_lesson, new_lessons, content)

# Replace toggleProjectCompletion
old_toggle_project = r"""  async toggleProjectCompletion\([\s\S]*?return \{ completed: true \};\n    \}\n  \}"""
new_toggle_project = """  async toggleProjectCompletion(
    userId: string,
    courseId: string,
    projectId: string,
  ): Promise<{ completed: boolean }> {
    const userObjId = new Types.ObjectId(userId);
    const courseObjId = new Types.ObjectId(courseId);
    const projectObjId = new Types.ObjectId(projectId);

    const progress = await this.progressModel.findOne({
      userId: userObjId,
      courseId: courseObjId,
    });
    if (!progress) {
      throw new Error('Progress record not found. User might not be enrolled.');
    }

    const isCompleted = progress.completedProjects.some((id) =>
      id.equals(projectObjId),
    );

    if (isCompleted) {
      await this.progressModel.updateOne(
        { userId: userObjId, courseId: courseObjId },
        { 
          $pull: { completedProjects: projectObjId },
          $set: { isDirty: true }
        },
      );
    } else {
      await this.progressModel.updateOne(
        { userId: userObjId, courseId: courseObjId },
        { 
          $addToSet: { completedProjects: projectObjId },
          $set: { isDirty: true }
        },
      );
    }

    const totalLessons = await this.lessonModel.countDocuments({
      courseId: courseObjId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userObjId, courseObjId, totalLessons);

    return { completed: !isCompleted };
  }"""
content = re.sub(old_toggle_project, new_toggle_project, content)

# Replace recordModuleQuizCompletion with saveQuizScore
old_quiz = r"""  async recordModuleQuizCompletion\([\s\S]*?totalLessons,\n    \);\n  \}"""

new_quiz = """  async saveQuizScore(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    moduleId: Types.ObjectId,
    quizId: Types.ObjectId,
    scorePercentage: number,
    passed: boolean,
    answers: any[] = []
  ): Promise<void> {
    const lastAttempt = await this.quizAttemptModel.findOne({ userId, quizId }).sort({ attemptNumber: -1 });
    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    await this.quizAttemptModel.create({
      userId,
      quizId,
      moduleId,
      status: QuizAttemptStatus.COMPLETED,
      score: scorePercentage,
      percentage: scorePercentage,
      passed,
      attemptNumber,
      quizVersion: 1,
      startedAt: new Date(),
      completedAt: new Date(),
      answers,
    });

    if (passed) {
      await this.moduleCompletionModel.updateOne(
        { userId, moduleId },
        {
          $set: {
            courseId,
            status: ModuleStatus.COMPLETED,
            quizScore: scorePercentage,
            completedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    await this.progressModel.updateOne(
      { userId, courseId },
      { $set: { isDirty: true } },
      { upsert: true }
    );

    const totalLessons = await this.lessonModel.countDocuments({
      courseId,
      isDeleted: { $ne: true },
    });
    await this.progressCalculationService.recalculatePercentage(userId, courseId, totalLessons);
  }"""

content = re.sub(old_quiz, new_quiz, content)

# Also fix the import QuizAttemptStatus
if "QuizAttemptStatus" not in content:
    content = content.replace("import { QuizAttempt, QuizAttemptDocument }", "import { QuizAttempt, QuizAttemptDocument, QuizAttemptStatus }")

with open('src/modules/progress/progress.service.ts', 'w') as f:
    f.write(content)
