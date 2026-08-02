import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../schemas/job.schema';

export class JobSalaryDto {
  @ApiProperty({ description: 'Minimum salary' })
  @IsNumber()
  min: number;

  @ApiProperty({ description: 'Maximum salary' })
  @IsNumber()
  max: number;

  @ApiProperty({ description: 'Currency unit' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Salary period', enum: ['LPA', 'Monthly', 'Hourly'] })
  @IsEnum(['LPA', 'Monthly', 'Hourly'])
  @IsNotEmpty()
  period: 'LPA' | 'Monthly' | 'Hourly';
}

export class JobEligibilityDto {
  @ApiProperty({ description: 'Minimum required CGPA' })
  @IsNumber()
  minimumCgpa: number;

  @ApiProperty({ description: 'Allowed branch departments list' })
  @IsArray()
  @IsString({ each: true })
  allowedBranches: string[];

  @ApiProperty({ description: 'Allowed graduation batch years' })
  @IsArray()
  @IsNumber({}, { each: true })
  batchYears: number[];
}

export class CreateJobDto {
  @ApiProperty({ description: 'Company reference ID' })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: 'Job role reference ID' })
  @IsMongoId()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ description: 'Specific title, e.g. SDE-1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Location of the job' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Salary structure',
    type: () => JobSalaryDto,
  })
  @ValidateNested()
  @Type(() => JobSalaryDto)
  salary: JobSalaryDto;

  @ApiPropertyOptional({ description: 'External application link' })
  @IsUrl()
  @IsOptional()
  applyUrl?: string;

  @ApiProperty({ description: 'Application deadline date' })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({ description: 'Summary description of the job' })
  @IsString()
  @IsNotEmpty()
  jobSummary: string;

  @ApiProperty({ description: 'List of required skills for the job', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiProperty({
    description: 'Experience required string description, e.g. 0-2 years',
  })
  @IsString()
  @IsNotEmpty()
  experienceRequired: string;

  @ApiProperty({
    description: 'Employment type',
    enum: ['Internship', 'Full-time', 'Part-time', 'Contract'],
  })
  @IsEnum(['Internship', 'Full-time', 'Part-time', 'Contract'])
  @IsNotEmpty()
  employmentType: string;

  @ApiProperty({
    description: 'Work mode',
    enum: ['Remote', 'Hybrid', 'On-site'],
  })
  @IsEnum(['Remote', 'Hybrid', 'On-site'])
  @IsNotEmpty()
  workMode: string;

  @ApiPropertyOptional({
    description: 'Job eligibility requirements criteria',
    type: () => JobEligibilityDto,
  })
  @ValidateNested()
  @Type(() => JobEligibilityDto)
  @IsOptional()
  eligibilityCriteria?: JobEligibilityDto;

  @ApiPropertyOptional({
    description: 'Job status',
    enum: JobStatus,
  })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Is featured job' })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}
