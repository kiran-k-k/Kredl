import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiProperty({ description: 'Publish status of the quiz', required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
