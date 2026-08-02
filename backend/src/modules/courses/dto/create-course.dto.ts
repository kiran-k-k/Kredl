import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: 'Unique slug for the course URL' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @ApiProperty({
    description: 'Short description of the course',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  shortDescription: string;

  @ApiProperty({
    description: 'Detailed description of the course',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    description: 'Category of the course',
    enum: [
      'Software Development',
      'Artificial Intelligence',
      'Embedded Systems',
      'Productivity',
      'Placement',
      'Communication',
      'Competitive Exams',
      'DSA',
      'Java',
      'Web Dev',
      'System Design',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'Software Development',
    'Artificial Intelligence',
    'Embedded Systems',
    'Productivity',
    'Placement',
    'Communication',
    'Competitive Exams',
    'DSA',
    'Java',
    'Web Dev',
    'System Design',
  ])
  category: string;

  @ApiProperty({
    description: 'Difficulty level of the course',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  difficulty: string;

  @ApiProperty({ description: 'URL to the course thumbnail' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  thumbnail: string;

  @ApiPropertyOptional({ description: 'Alternative text for course thumbnail' })
  @IsOptional()
  @IsString()
  thumbnailAlt?: string;

  @ApiProperty({
    description: 'Estimated duration (e.g. "6 Months", "120 Hours")',
  })
  @IsString()
  @IsNotEmpty()
  estimatedDuration: string;

  @ApiPropertyOptional({ description: 'Custom display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Featured flag', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Publish flag', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'SEO optimization title' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO optimization description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the course',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'List of learning outcomes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional({
    description: 'List of prerequisites',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];
}
