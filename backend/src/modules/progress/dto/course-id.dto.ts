import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CourseIdDto {
  @ApiProperty({ description: 'Course ID' })
  @IsNotEmpty()
  @IsMongoId()
  courseId: string;
}
