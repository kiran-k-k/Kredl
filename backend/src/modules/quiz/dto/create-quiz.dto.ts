import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionDto {
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
}

export class CreateQuizDto {
  @ApiProperty({ description: 'The module ID that owns this quiz' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ description: 'Title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the quiz', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [QuestionDto], description: 'List of quiz questions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];

  @ApiProperty({ description: 'Time limit in minutes', default: 15 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  timeLimitMinutes?: number;

  @ApiProperty({ description: 'Passing score percentage (1-100)', default: 70 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  passingScorePercentage?: number;

  @ApiProperty({ description: 'Total marks for the quiz', default: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalMarks?: number;

  @ApiProperty({
    description: 'Should questions shuffle options',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @ApiProperty({
    description: 'Show correct answers after submission',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showCorrectAnswerAfterSubmit?: boolean;

  @ApiProperty({ description: 'Max attempts allowed', default: 3 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Cooldown period between attempts in minutes',
    default: 1440,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cooldownMinutes?: number;

  @ApiProperty({ description: 'Quiz Type', enum: ['REGULAR', 'PRACTICE', 'MOCK_TEST'], default: 'REGULAR' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'List of target companies for mock tests', type: [String], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  targetCompanies?: string[];
}
