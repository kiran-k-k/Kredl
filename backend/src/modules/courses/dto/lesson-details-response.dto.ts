import { ApiProperty } from '@nestjs/swagger';
import { ModuleLessonDto } from './module-lessons-response.dto';

export class CourseSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class ModuleSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  progress: number;
}

export class LessonContentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  youtubeUrl: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: [String] })
  learningObjectives: string[];

  @ApiProperty({ type: [String] })
  keyPoints: string[];

  @ApiProperty()
  notes: string;

  @ApiProperty()
  completed: boolean;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty()
  locked: boolean;
}

export class LessonNavigationDto {
  @ApiProperty({ required: false })
  prevLessonSlug?: string;

  @ApiProperty({ required: false })
  nextLessonSlug?: string;

  @ApiProperty()
  isFinalLesson: boolean;
}

export class LessonDetailsResponseDto {
  @ApiProperty({ type: CourseSummaryDto })
  course: CourseSummaryDto;

  @ApiProperty({ type: ModuleSummaryDto })
  module: ModuleSummaryDto;

  @ApiProperty({ type: LessonContentDto })
  lesson: LessonContentDto;

  @ApiProperty({ type: [ModuleLessonDto] })
  sisterLessons: ModuleLessonDto[];

  @ApiProperty({ type: LessonNavigationDto })
  navigation: LessonNavigationDto;
}
