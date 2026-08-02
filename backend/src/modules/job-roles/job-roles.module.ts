import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobRole, JobRoleSchema } from './schemas/job-role.schema';
import {
  PublicJobRolesController,
  AdminJobRolesController,
} from './job-roles.controller';
import { JobRolesService } from './job-roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JobRole.name, schema: JobRoleSchema }]),
  ],
  controllers: [PublicJobRolesController, AdminJobRolesController],
  providers: [JobRolesService],
  exports: [JobRolesService],
})
export class JobRolesModule {}
