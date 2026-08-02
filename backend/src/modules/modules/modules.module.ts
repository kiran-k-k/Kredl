import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModulesService } from './modules.service';
import { CourseModulesController } from './modules.controller';
import { CourseModule, CourseModuleSchema } from './schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseModule.name, schema: CourseModuleSchema },
    ]),
  ],
  controllers: [CourseModulesController],
  providers: [CourseModulesService],
  exports: [CourseModulesService],
})
export class CourseModulesModule {}
