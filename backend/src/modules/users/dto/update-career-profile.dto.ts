import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class UpdateCareerProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currentStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  graduationYear?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredJobRoles?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredCompanies?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentSkills?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  skillLevel?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  programmingConfidence?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dailyStudyGoal?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  learningStyle?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredStudyTime?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  placementGoal?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  joiningTimeline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  aptitudeLevel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  communicationLevel?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resumeReady?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  githubProfile?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedinProfile?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  portfolioWebsite?: string;
}
