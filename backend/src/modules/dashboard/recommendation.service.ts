import { Injectable, Inject, Logger } from '@nestjs/common';
import { RECOMMENDATION_PROVIDER } from './interfaces/recommendation-provider.interface';
import type { RecommendationProvider } from './interfaces/recommendation-provider.interface';
import { RecommendedCoursesResponseDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Progress,
  ProgressDocument,
} from '../progress/schemas/progress.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @Inject(RECOMMENDATION_PROVIDER)
    private readonly provider: RecommendationProvider,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
  ) {}

  async getRecommendations(
    userId: string,
  ): Promise<RecommendedCoursesResponseDto> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('roleId')
        .lean()
        .exec();

      if (!user) {
        throw new Error('User not found for recommendations');
      }

      // 1. Determine user skills (if any). Since the schema lacks a skills array,
      // this defaults to an empty array for now as instructed.
      const userSkills: string[] = [];

      // Fetch user's enrolled and completed courses to exclude them from recommendations
      const userProgress = await this.progressModel
        .find({ userId: new Types.ObjectId(userId) })
        .select('courseId')
        .lean()
        .exec();
      const excludedCourseIds = userProgress.map((p) => p.courseId);

      // 2. Fetch all recommendations in parallel for performance
      const [
        topCourses,
        newestCourses,
        trendingCourses,
        roleBasedCourses,
        skillBasedCourses,
      ] = await Promise.all([
        this.provider.getTopCourses(userId, 10, excludedCourseIds),
        this.provider.getNewestCourses(userId, 10, excludedCourseIds),
        this.provider.getTrendingCourses(userId, 10, excludedCourseIds),
        this.provider.getRoleBasedCourses(
          user.roleId.toString(),
          10,
          excludedCourseIds,
        ),
        this.provider.getSkillBasedCourses(userSkills, 10, excludedCourseIds),
      ]);

      return {
        topCourses,
        newestCourses,
        trendingCourses,
        roleBasedCourses,
        skillBasedCourses,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch recommendations for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Fallback response for resilience
      return {
        topCourses: [],
        newestCourses: [],
        trendingCourses: [],
        roleBasedCourses: [],
        skillBasedCourses: [],
      };
    }
  }
}
