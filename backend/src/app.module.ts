import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { SECURITY_CONFIG } from './config/security.config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database';
import { CommonModule } from './common/common.module';
import { AdminActionsInterceptor } from './common/interceptors/admin-actions.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseModulesModule } from './modules/modules/modules.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LessonNotesModule } from './modules/lesson-notes/lesson-notes.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CloudinaryModule } from './modules/cloudinary';
import { EmailModule } from './modules/email';
import { ProgressModule } from './modules/progress/progress.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobRolesModule } from './modules/job-roles/job-roles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { PlacementDrivesModule } from './modules/placement-drives/placement-drives.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AdminActionsLogModule } from './modules/admin-actions-log/admin-actions-log.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DatabaseHealthModule } from './modules/database-health/database-health.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobAutomationModule } from './modules/job-automation/job-automation.module';
import { AdminModule } from './modules/admin/admin.module';
import { TpoModule } from './modules/tpo/tpo.module';
import { SearchModule } from './modules/search/search.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        MONGODB_URI: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        FRONTEND_OAUTH_REDIRECT_URL: Joi.string().default(
          'http://localhost:3000/auth/success',
        ),
        FRONTEND_URL: Joi.string().required(),
        FRONTEND_VERIFY_EMAIL_URL: Joi.string().required(),
        FRONTEND_RESET_PASSWORD_URL: Joi.string().required(),
        RESEND_API_KEY: Joi.string().required(),
        EMAIL_FROM: Joi.string().email().required(),
        EMAIL_FROM_NAME: Joi.string().default('Kredl'),

        CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
        CLOUDINARY_API_KEY: Joi.string().optional(),
        CLOUDINARY_API_SECRET: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          name: 'default',
          ttl: SECURITY_CONFIG.THROTTLER.DEFAULT.TTL,
          limit: SECURITY_CONFIG.THROTTLER.DEFAULT.LIMIT,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    DatabaseModule,
    JobAutomationModule,

    RolesModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    CourseModulesModule,
    LessonsModule,
    LessonNotesModule,
    ProjectsModule,
    CloudinaryModule,
    EmailModule,
    ProgressModule,
    QuizModule,
    CompaniesModule,
    JobRolesModule,
    JobsModule,
    ApplicationsModule,
    PlacementDrivesModule,
    BookmarksModule,
    NotificationsModule,
    AnnouncementsModule,
    AdminActionsLogModule,
    AnalyticsModule,
    DatabaseHealthModule,
    DashboardModule,
    AdminModule,
    TpoModule,
    SearchModule,
    InquiriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActionsInterceptor,
    },
  ],
})
export class AppModule {}
