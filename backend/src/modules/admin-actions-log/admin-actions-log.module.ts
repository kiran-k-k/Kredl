import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminActionsLog,
  AdminActionsLogSchema,
} from './schemas/admin-actions-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminActionsLog.name, schema: AdminActionsLogSchema },
    ]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class AdminActionsLogModule {}
