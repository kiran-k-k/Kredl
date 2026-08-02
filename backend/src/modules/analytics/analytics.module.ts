import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './schemas/analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
    ]),
  ],
  providers: [],
  exports: [],
})
export class AnalyticsModule {}
