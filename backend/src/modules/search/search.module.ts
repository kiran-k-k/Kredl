import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';

import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { CourseModule as ModuleEntity, CourseModuleSchema } from '../modules/schemas/module.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { JobRole, JobRoleSchema } from '../job-roles/schemas/job-role.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleEntity.name, schema: CourseModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Company.name, schema: CompanySchema },
      { name: JobRole.name, schema: JobRoleSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
