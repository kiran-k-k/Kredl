import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { AdminQueryDto } from '../../../common/dto/admin-query.dto';

export class GlobalSearchQueryDto extends AdminQueryDto {
  @ApiPropertyOptional({
    description: 'Comma-separated list of entities to search (e.g., course,job,company). Available: course, module, lesson, company, role, job',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim().toLowerCase());
    }
    return value;
  })
  type?: string[];
}
