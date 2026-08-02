import { IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOnboardingDto {
  @ApiProperty({
    description: 'The ID of the target job role',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  jobRoleId?: string;

  @ApiProperty({ description: 'The ID of the target course', required: false })
  @IsMongoId()
  @IsOptional()
  courseId?: string;
}
