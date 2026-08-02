import { IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ProjectsFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter projects by course ID' })
  @IsOptional()
  @IsMongoId()
  courseId?: string;
}
