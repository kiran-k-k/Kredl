import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  thumbnailAlt: string;

  @ApiProperty()
  difficulty: string;

  @ApiProperty()
  estimatedDuration: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  moduleCount: number;

  @ApiProperty()
  lessonCount: number;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  seoTitle?: string;

  @ApiProperty()
  seoDescription?: string;

  @ApiProperty()
  isEnrolled: boolean;

  @ApiProperty({ type: [String], required: false })
  completedLessons?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
