import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class EligibilityCriteriaDto {
  @ApiProperty()
  @IsNumber()
  minimumCgpa: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  allowedBranches: string[];

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  batchYears: number[];
}

export class CreatePlacementDriveDto {
  @ApiProperty({ description: 'The associated Company ID' })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: 'Title of the placement drive' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Eligibility criteria for the drive' })
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  @IsNotEmpty()
  eligibilityCriteria: EligibilityCriteriaDto;

  @ApiProperty({ description: 'Scheduled date of the drive' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({ enum: ['upcoming', 'ongoing', 'completed'] })
  @IsEnum(['upcoming', 'ongoing', 'completed'])
  driveStatus: string;
}
