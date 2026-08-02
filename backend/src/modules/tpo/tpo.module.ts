import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { TpoDashboardController } from './controllers/tpo-dashboard.controller';
import { TpoStudentsController } from './controllers/tpo-students.controller';
import { TpoDashboardService } from './services/tpo-dashboard.service';
import { TpoStudentsService } from './services/tpo-students.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  PlacementDrive,
  PlacementDriveSchema,
} from '../placement-drives/schemas/placement-drive.schema';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import {
  AdminActionsLog,
  AdminActionsLogSchema,
} from '../admin-actions-log/schemas/admin-actions-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PlacementDrive.name, schema: PlacementDriveSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: AdminActionsLog.name, schema: AdminActionsLogSchema },
    ]),
    CacheModule.register({
      ttl: 60000,
      max: 10,
    }),
  ],
  controllers: [TpoDashboardController, TpoStudentsController],
  providers: [TpoDashboardService, TpoStudentsService],
})
export class TpoModule {}
