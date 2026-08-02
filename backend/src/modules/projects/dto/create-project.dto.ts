import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'ID of the parent module' })
  @IsMongoId()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ description: 'ID of the parent course' })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Title of the project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Short description of the project' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiPropertyOptional({ description: 'Detailed description of the project' })
  @IsString()
  @IsOptional()
  detailedDescription?: string;

  @ApiPropertyOptional({
    description: 'Repository URL for the project starter code or reference',
  })
  @IsUrl()
  @IsOptional()
  repositoryUrl?: string;

  @ApiPropertyOptional({
    description: 'Technologies used in the project',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @ApiPropertyOptional({ description: 'Difficulty level of the project' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Learning objectives from the project',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
  })
  @IsOptional()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Display order',
  })
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Suggested improvements or advanced features for the project',
  })
  @IsString()
  @IsOptional()
  suggestedImprovements?: string;
}
