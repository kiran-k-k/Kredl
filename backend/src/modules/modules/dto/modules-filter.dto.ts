import { IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ModulesFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter modules by course ID' })
  @IsOptional()
  @IsMongoId()
  courseId?: string;
}
