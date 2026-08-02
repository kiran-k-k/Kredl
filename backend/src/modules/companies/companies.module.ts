import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { CompanyReview, CompanyReviewSchema } from './schemas/company-review.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { CompaniesController } from './companies.controller';
import { CompanyReviewsController } from './company-reviews.controller';
import { CompaniesService } from './companies.service';
import { CompanyReviewsService } from './company-reviews.service';
import {
  AdminActionsLog,
  AdminActionsLogSchema,
} from '../admin-actions-log/schemas/admin-actions-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: CompanyReview.name, schema: CompanyReviewSchema },
      { name: AdminActionsLog.name, schema: AdminActionsLogSchema },
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  controllers: [CompaniesController, CompanyReviewsController],
  providers: [CompaniesService, CompanyReviewsService],
  exports: [CompaniesService, CompanyReviewsService],
})
export class CompaniesModule {}
