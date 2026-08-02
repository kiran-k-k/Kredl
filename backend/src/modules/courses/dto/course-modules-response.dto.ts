import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourseModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  lessonCount: number;

  @ApiProperty({ type: [String] })
  completedLessons: string[];

  @ApiProperty()
  estimatedDuration: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  locked: boolean;

  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  nextLessonId?: string;

  @ApiPropertyOptional({ type: [Object] })
  lessons?: any[];
}

export class CourseSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  completedModules: number;

  @ApiProperty()
  totalModules: number;
}

export class CourseModulesListResponseDto {
  @ApiProperty({ type: CourseSummaryDto })
  course: CourseSummaryDto;

  @ApiProperty({ type: [CourseModuleResponseDto] })
  modules: CourseModuleResponseDto[];
}
