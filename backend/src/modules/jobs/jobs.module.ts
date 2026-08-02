import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { JobsController } from './jobs.controller';
import { PublicJobsController } from './public-jobs.controller';
import { JobsService } from './jobs.service';
import { CompaniesModule } from '../companies/companies.module';
import { JobRole, JobRoleSchema } from '../job-roles/schemas/job-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobRole.name, schema: JobRoleSchema }
    ]),
    CompaniesModule
  ],
  controllers: [JobsController, PublicJobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
