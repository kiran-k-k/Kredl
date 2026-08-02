import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonNotesService } from './lesson-notes.service';
import { LessonNotesController } from './lesson-notes.controller';
import { LessonNote, LessonNoteSchema } from './schemas/lesson-note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonNote.name, schema: LessonNoteSchema },
    ]),
  ],
  controllers: [LessonNotesController],
  providers: [LessonNotesService],
  exports: [LessonNotesService],
})
export class LessonNotesModule {}
