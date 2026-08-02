import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { ProgressModule } from '../progress/progress.module';
import {
  CourseModule,
  CourseModuleSchema,
} from '../modules/schemas/module.schema';
import { Progress, ProgressSchema } from '../progress/schemas/progress.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  ModuleCompletion,
  ModuleCompletionSchema,
} from '../progress/schemas/module-completion.schema';
import {
  AdminActionsLog,
  AdminActionsLogSchema,
} from '../admin-actions-log/schemas/admin-actions-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Progress.name, schema: ProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: ModuleCompletion.name, schema: ModuleCompletionSchema },
      { name: AdminActionsLog.name, schema: AdminActionsLogSchema },
    ]),
    forwardRef(() => ProgressModule),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService, MongooseModule],
})
export class QuizModule {}
