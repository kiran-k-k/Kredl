/* eslint-disable */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Progress, ProgressSchema } from '../progress/schemas/progress.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  CourseModule,
  CourseModuleSchema,
} from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import {
  ModuleCompletion,
  ModuleCompletionSchema,
} from '../progress/schemas/module-completion.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Bookmark, BookmarkSchema } from '../bookmarks/schemas/bookmark.schema';
import {
  QuizAttempt,
  QuizAttemptSchema,
} from '../quiz/schemas/quiz-attempt.schema';
import { RecommendationService } from './recommendation.service';
import { RECOMMENDATION_PROVIDER } from './interfaces/recommendation-provider.interface';
import { RuleBasedRecommendationProvider } from './providers/rule-based-recommendation.provider';
import { ACTIVITY_PROVIDERS } from './interfaces/activity-provider.interface';
import { ProgressActivityProvider } from './providers/activity/progress-activity.provider';
import { BookmarkActivityProvider } from './providers/activity/bookmark-activity.provider';
import { QuizActivityProvider } from './providers/activity/quiz-activity.provider';
import { ModuleCompletionActivityProvider } from './providers/activity/module-completion-activity.provider';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { DashboardFacadeService } from './dashboard-facade.service';
import { ProgressModule } from '../progress/progress.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    NotificationsModule,
    UsersModule,
    forwardRef(() => ProgressModule),
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: ModuleCompletion.name, schema: ModuleCompletionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [DashboardController],
  exports: [DashboardService],
  providers: [
    DashboardService,
    DashboardFacadeService,
    RecommendationService,
    {
      provide: RECOMMENDATION_PROVIDER,
      useClass: RuleBasedRecommendationProvider,
    },
    ProgressActivityProvider,
    BookmarkActivityProvider,
    QuizActivityProvider,
    ModuleCompletionActivityProvider,
    {
      provide: ACTIVITY_PROVIDERS,
      useFactory: (p, b, q, m) => [p, b, q, m],
      inject: [
        ProgressActivityProvider,
        BookmarkActivityProvider,
        QuizActivityProvider,
        ModuleCompletionActivityProvider,
      ],
    },
  ],
})
export class DashboardModule {}
