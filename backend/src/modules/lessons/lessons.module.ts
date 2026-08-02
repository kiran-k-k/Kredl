import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { ProgressModule } from '../progress/progress.module';
import { LessonNotesModule } from '../lesson-notes/lesson-notes.module';
import {
  CourseModule,
  CourseModuleSchema,
} from '../modules/schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
    ]),
    ProgressModule,
    LessonNotesModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
