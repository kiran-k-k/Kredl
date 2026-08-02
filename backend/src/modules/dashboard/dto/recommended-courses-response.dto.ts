import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RecommendedCourseDto } from './recommended-course.dto';

export class TopCourseDto extends RecommendedCourseDto {}
export class TrendingCourseDto extends RecommendedCourseDto {}
export class RoleBasedCourseDto extends RecommendedCourseDto {}
export class SkillBasedCourseDto extends RecommendedCourseDto {}
export class NewestCourseDto extends RecommendedCourseDto {}

export class RecommendedCoursesResponseDto {
  @ValidateNested({ each: true })
  @Type(() => TopCourseDto)
  topCourses: TopCourseDto[];

  @ValidateNested({ each: true })
  @Type(() => NewestCourseDto)
  newestCourses: NewestCourseDto[];

  @ValidateNested({ each: true })
  @Type(() => TrendingCourseDto)
  trendingCourses: TrendingCourseDto[];

  @ValidateNested({ each: true })
  @Type(() => RoleBasedCourseDto)
  roleBasedCourses: RoleBasedCourseDto[];

  @ValidateNested({ each: true })
  @Type(() => SkillBasedCourseDto)
  skillBasedCourses: SkillBasedCourseDto[];
}
