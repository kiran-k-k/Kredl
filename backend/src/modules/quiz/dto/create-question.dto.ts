import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The text of the question' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ description: 'List of options for MCQ answers', minItems: 2 })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  @ApiProperty({
    description: 'Index of the correct answer in the options array',
  })
  @IsNumber()
  @Min(0)
  correctAnswerIndex: number;

  @ApiProperty({
    description: 'Explanation for the correct answer',
    required: false,
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ description: 'Display order of the question', default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
