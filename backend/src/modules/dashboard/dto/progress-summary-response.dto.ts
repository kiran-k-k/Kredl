import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ProgressSummaryDto {
  @ApiProperty({
    description: 'Total number of courses the student is enrolled in',
    example: 6,
  })
  coursesEnrolled: number;

  @ApiProperty({
    description: 'Total number of courses fully completed',
    example: 2,
  })
  coursesCompleted: number;

  @ApiProperty({
    description: 'Total number of modules completed across all courses',
    example: 35,
  })
  modulesCompleted: number;

  @ApiProperty({
    description: 'Total number of lessons completed',
    example: 182,
  })
  lessonsCompleted: number;

  @ApiProperty({
    description: 'Average progress percentage across all enrolled courses',
    example: 68,
  })
  overallProgress: number;

  @ApiProperty({
    description: 'Consecutive learning days',
    example: 9,
  })
  learningStreak: number;

  @ApiProperty({
    description: 'Total hours learned based on completed lessons duration',
    example: 47.5,
  })
  hoursLearned: number;

  @ApiProperty({ description: 'Active project name', required: false })
  activeProject?: string;

  @ApiProperty({ description: 'Estimated completion time string', required: false })
  estimatedCompletion?: string;
}

export class ProgressSummaryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ProgressSummaryDto })
  @ValidateNested()
  @Type(() => ProgressSummaryDto)
  data: ProgressSummaryDto;
}
