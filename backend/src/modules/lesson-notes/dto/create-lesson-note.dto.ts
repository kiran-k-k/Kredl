import { IsString, IsNotEmpty, IsMongoId, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonNoteDto {
  @ApiProperty({ description: 'ID of the parent lesson' })
  @IsMongoId()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ description: 'Title of the lesson note' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content of the lesson note' })
  @IsOptional()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Order of the lesson note' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
