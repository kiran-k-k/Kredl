import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
  IsArray,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ description: 'ID of the parent module' })
  @IsMongoId()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ description: 'Title of the lesson' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the lesson' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'YouTube URL for the lesson video' })
  @IsUrl()
  @IsOptional()
  youtubeUrl?: string;

  @ApiPropertyOptional({
    description: 'Learning objectives of the lesson',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Key points to remember',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyPoints?: string[];

  @ApiPropertyOptional({ description: 'GitHub URL for code reference' })
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'Challenge for the student to solve' })
  @IsString()
  @IsOptional()
  challengeDescription?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description:
      'Order of the lesson in the module (must be unique per module)',
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({ description: 'Status of the lesson (draft, published, archived)' })
  @IsString()
  @IsOptional()
  status?: string;
}
