import { PartialType } from '@nestjs/swagger';
import { CreateLessonNoteDto } from './create-lesson-note.dto';

export class UpdateLessonNoteDto extends PartialType(CreateLessonNoteDto) {}
