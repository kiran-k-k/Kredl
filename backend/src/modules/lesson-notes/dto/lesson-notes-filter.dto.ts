import { IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class LessonNotesFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter lesson notes by lesson ID' })
  @IsOptional()
  @IsMongoId()
  lessonId?: string;
}
