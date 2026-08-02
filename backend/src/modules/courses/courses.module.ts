import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { Progress, ProgressSchema } from '../progress/schemas/progress.schema';
import { CourseModulesModule } from '../modules/modules.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    CourseModulesModule,
    LessonsModule,
    ProgressModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
