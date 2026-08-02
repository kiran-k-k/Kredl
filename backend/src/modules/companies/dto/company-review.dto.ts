import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ReviewStatus } from '../schemas/company-review.schema';

export class CreateCompanyReviewDto {
  @ApiProperty({ description: 'Rating out of 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pros?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cons?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  placementExperience: string;
}

export class UpdateCompanyReviewDto extends PartialType(CreateCompanyReviewDto) {}

export class ModerateCompanyReviewDto {
  @ApiProperty({ enum: ReviewStatus, required: false })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  isHidden?: boolean;
}
