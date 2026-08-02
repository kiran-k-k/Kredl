import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  CourseModule,
  CourseModuleSchema,
} from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import {
  LessonNote,
  LessonNoteSchema,
} from '../lesson-notes/schemas/lesson-note.schema';
import {
  AdminActionsLog,
  AdminActionsLogSchema,
} from '../admin-actions-log/schemas/admin-actions-log.schema';
import { DatabaseHealthModule } from '../database-health/database-health.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { QuizModule } from '../quiz/quiz.module';
import { AuthModule } from '../auth/auth.module';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminQuizController } from './controllers/admin-quiz.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonNote.name, schema: LessonNoteSchema },
      { name: AdminActionsLog.name, schema: AdminActionsLogSchema },
    ]),
    CacheModule.register({
      ttl: 60000, // 60 seconds
      max: 10,
    }),
    DatabaseHealthModule,
    CoursesModule,
    UsersModule,
    QuizModule,
    AuthModule,
  ],
  controllers: [
    AdminDashboardController,
    AdminCoursesController,
    AdminUsersController,
    AdminQuizController,
    AdminAnalyticsController,
  ],
  providers: [AdminDashboardService],
})
export class AdminModule {}
