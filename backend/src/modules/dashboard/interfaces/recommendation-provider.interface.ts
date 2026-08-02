import { RecommendedCourseDto } from '../dto';

export const RECOMMENDATION_PROVIDER = 'RECOMMENDATION_PROVIDER';

export interface RecommendationProvider {
  getTopCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]>;
  getNewestCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]>;
  getTrendingCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]>;
  getRoleBasedCourses(
    roleId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]>;
  getSkillBasedCourses(
    skills: string[],
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]>;
}
