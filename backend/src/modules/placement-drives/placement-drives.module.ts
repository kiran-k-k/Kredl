import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlacementDrive,
  PlacementDriveSchema,
} from './schemas/placement-drive.schema';

import { PlacementDrivesController } from './controllers/placement-drives.controller';
import { PlacementDrivesService } from './services/placement-drives.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlacementDrive.name, schema: PlacementDriveSchema },
    ]),
    UsersModule,
  ],
  controllers: [PlacementDrivesController],
  providers: [PlacementDrivesService],
  exports: [PlacementDrivesService],
})
export class PlacementDrivesModule {}
