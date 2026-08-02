import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { JobAutomationService } from './job-automation.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
  providers: [JobAutomationService],
  exports: [JobAutomationService],
})
export class JobAutomationModule {}
