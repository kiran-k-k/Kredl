import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalaryRangeDto {
  @ApiProperty({ description: 'Minimum salary package in LPA' })
  @IsNumber()
  min: number;

  @ApiProperty({ description: 'Maximum salary package in LPA' })
  @IsNumber()
  max: number;

  @ApiProperty({ description: 'Currency code, e.g. LPA or USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class EligibilityCriteriaDto {
  @ApiProperty({ description: 'Minimum CGPA requirement' })
  @IsNumber()
  minimumCgpa: number;

  @ApiProperty({ description: 'Allowed branches/departments' })
  @IsArray()
  @IsString({ each: true })
  allowedBranches: string[];

  @ApiProperty({ description: 'Required skills checklist' })
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];
}

export class FaqDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Answer text' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateCompanyDto {
  @ApiProperty({ description: 'Name of the company' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Company logo URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  logo: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Detailed overview' })
  @IsString()
  @IsNotEmpty()
  overview: string;

  @ApiPropertyOptional({ description: 'Hiring process rounds description' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiringProcess?: string[];

  @ApiPropertyOptional({ description: 'Interview rounds details' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interviewRounds?: string[];

  @ApiPropertyOptional({
    description: 'Offered salary packages range',
    type: () => SalaryRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salaryRange?: SalaryRangeDto;

  @ApiPropertyOptional({
    description: 'Academic and skills eligibility requirements',
    type: () => EligibilityCriteriaDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibilityCriteria?: EligibilityCriteriaDto;

  @ApiPropertyOptional({
    description: 'Frequently Asked Questions',
    type: () => [FaqDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs?: FaqDto[];

  @ApiPropertyOptional({ description: 'Preparation tips' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preparationTips?: string[];
}
