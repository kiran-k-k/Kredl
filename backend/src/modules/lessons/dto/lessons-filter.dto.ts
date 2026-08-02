import { IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class LessonsFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter lessons by module ID' })
  @IsOptional()
  @IsMongoId()
  moduleId?: string;

  @ApiPropertyOptional({ description: 'Filter lessons by course ID' })
  @IsOptional()
  @IsMongoId()
  courseId?: string;
}
