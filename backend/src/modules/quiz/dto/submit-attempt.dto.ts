import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerSubmissionDto {
  @ApiProperty({ description: 'The ID of the question being answered' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'The index of the selected option' })
  @IsNumber()
  @Min(0)
  selectedAnswerIndex: number;
}

export class SubmitAttemptDto {
  @ApiProperty({
    type: [AnswerSubmissionDto],
    description: 'List of submitted answers',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmissionDto)
  answers: AnswerSubmissionDto[];

  @ApiProperty({
    description: 'Total time taken to complete the attempt in seconds',
  })
  @IsNumber()
  @Min(0)
  timeTakenSeconds: number;
}
