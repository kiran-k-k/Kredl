import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  ArrayUnique,
  Min,
  Max,
  IsObject,
  Matches,
} from 'class-validator';
import { ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  JobRoleCategory,
  ExperienceLevel,
} from '../schemas/job-role.schema';

export class RoadmapStepDto {
  @ApiProperty({ description: 'Roadmap step title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({ description: 'Roadmap step description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Duration of the step in weeks' })
  @IsNumber()
  @Min(1)
  @Max(52)
  durationWeeks: number;

  @ApiPropertyOptional({ description: 'Course ID reference' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Module ID reference' })
  @IsOptional()
  @IsString()
  moduleId?: string;
}

export class SalaryInfoDto {
  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'INR' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: '₹3L – ₹6L' })
  @IsString()
  @IsNotEmpty()
  fresherRange: string;

  @ApiProperty({ example: '₹8L' })
  @IsString()
  @IsNotEmpty()
  averageSalary: string;

  @ApiProperty({ example: '₹12L – ₹25L' })
  @IsString()
  @IsNotEmpty()
  experiencedRange: string;
}

export class ResumeGuidanceDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  requiredSections?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  technicalSkills?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedProjects?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedCertifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resumeChecklist?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commonMistakes?: string[];
}

export class CreateJobRoleDto {
  @ApiProperty({ description: 'Job role title, e.g. Java Developer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiProperty({ description: 'Short job description shown on listing cards' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(300)
  shortDescription: string;

  @ApiProperty({ description: 'Detailed job description' })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({
    enum: JobRoleCategory,
    default: JobRoleCategory.SOFTWARE_DEVELOPMENT,
  })
  @IsOptional()
  @IsEnum(JobRoleCategory)
  category?: JobRoleCategory;

  @ApiPropertyOptional({
    enum: ExperienceLevel,
    default: ExperienceLevel.FRESHER,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ example: '5 Months' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  estimatedLearningTime?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'List of required skills' })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  requiredSkills: string[];

  @ApiPropertyOptional({ description: 'List of preferred skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  preferredSkills?: string[];

  @ApiPropertyOptional({ description: 'List of responsibilities' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  responsibilities?: string[];

  @ApiPropertyOptional({ description: 'Structured salary information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryInfoDto)
  salaryInfo?: SalaryInfoDto;

  @ApiPropertyOptional({ description: 'Legacy plain-text salary range' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salaryRange?: string;

  @ApiPropertyOptional({
    description: 'Structured learning roadmap timeline',
    type: () => [RoadmapStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoadmapStepDto)
  roadmap?: RoadmapStepDto[];

  @ApiPropertyOptional({
    description: 'List of Company IDs currently hiring for this role',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companiesHiring?: string[];

  @ApiPropertyOptional({
    description: 'List of Project IDs recommended for this role',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedProjects?: string[];

  @ApiPropertyOptional({
    description:
      'Interview prep topics — keys are topic names, values are arrays of questions/concepts',
  })
  @IsOptional()
  @IsObject()
  interviewTopics?: Record<string, string[]>;

  @ApiPropertyOptional({ description: 'Structured resume guidance' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResumeGuidanceDto)
  resumeGuidance?: ResumeGuidanceDto;
}
