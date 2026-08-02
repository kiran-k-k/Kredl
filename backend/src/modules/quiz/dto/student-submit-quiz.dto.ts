import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerSubmissionDto } from './submit-attempt.dto';

export class StudentSubmitQuizDto {
  @ApiProperty({ description: 'The attempt ID to submit' })
  @IsString()
  @IsNotEmpty()
  attemptId: string;

  @ApiProperty({
    type: [AnswerSubmissionDto],
    description: 'List of submitted answers',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmissionDto)
  answers: AnswerSubmissionDto[];
}
