import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ description: 'ID of the parent course' })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Title of the module' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the module' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'Order of the module in the course (must be unique per course)',
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTimeMinutes?: number;

  @ApiPropertyOptional({ description: 'Status of the module (draft, published, archived)' })
  @IsString()
  @IsOptional()
  status?: string;
}
