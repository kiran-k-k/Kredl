import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { JobRole, JobRoleSchema } from '../job-roles/schemas/job-role.schema';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Job.name, schema: JobSchema },
      { name: Company.name, schema: CompanySchema },
      { name: JobRole.name, schema: JobRoleSchema },
    ]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
