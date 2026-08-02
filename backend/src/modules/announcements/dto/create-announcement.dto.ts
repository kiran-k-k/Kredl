import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { AudienceType } from '../schemas/announcement.schema';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'The title of the announcement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content/body of the announcement' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    enum: AudienceType,
    description: 'Target audience for the announcement',
  })
  @IsEnum(AudienceType)
  @IsNotEmpty()
  audience: AudienceType;

  @ApiProperty({ description: 'Expiration date of the announcement' })
  @IsDateString()
  @IsNotEmpty()
  expiresAt: string;

  @ApiProperty({ description: 'Whether the announcement is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Specific branches to target',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetBranches?: string[];

  @ApiProperty({
    description: 'Specific graduation years to target',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  targetYears?: number[];

  @ApiProperty({
    description: 'Specific courses to target',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  targetCourses?: string[];
}
