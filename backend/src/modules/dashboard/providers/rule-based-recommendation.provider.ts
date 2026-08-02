import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecommendationProvider } from '../interfaces/recommendation-provider.interface';
import { RecommendedCourseDto } from '../dto';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from '../../courses/schemas/course.schema';
import { Role, RoleDocument, RoleEnum } from '../../roles/schemas/role.schema';

@Injectable()
export class RuleBasedRecommendationProvider implements RecommendationProvider {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  private mapCourseToDto(course: any, reason: string): RecommendedCourseDto {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const createdBy = course.createdBy;
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      courseId: course._id?.toString() || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      title: course.title,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      slug: course.slug,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      thumbnail: course.thumbnail || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      shortDescription: course.description?.substring(0, 100) || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      difficulty: course.difficultyLevel || 'Beginner',
      estimatedDuration: 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      category: course.category,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      instructorName: createdBy?.fullName || 'Instructor',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      rating: course.rating || 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      totalStudents: course.enrollmentCount || 0,
      recommendationReason: reason,
    };
  }

  async getTopCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]> {
    const filter: Record<string, any> = {
      status: CourseStatus.PUBLISHED,
      isActive: true,
      isDeleted: false,
    };
    if (excludedCourseIds && excludedCourseIds.length > 0) {
      filter._id = { $nin: excludedCourseIds };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ rating: -1, enrollmentCount: -1, updatedAt: -1 })
      .limit(limit)
      .select(
        'title slug thumbnail description difficultyLevel category rating enrollmentCount createdBy',
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return courses.map((c) => this.mapCourseToDto(c, 'Highly rated course'));
  }

  async getNewestCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]> {
    const filter: Record<string, any> = {
      status: CourseStatus.PUBLISHED,
      isActive: true,
      isDeleted: false,
    };
    if (excludedCourseIds && excludedCourseIds.length > 0) {
      filter._id = { $nin: excludedCourseIds };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'title slug thumbnail description difficultyLevel category rating enrollmentCount createdBy',
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return courses.map((c) => this.mapCourseToDto(c, 'Recently published'));
  }

  async getTrendingCourses(
    userId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]> {
    const filter: Record<string, any> = {
      status: CourseStatus.PUBLISHED,
      isActive: true,
      isDeleted: false,
    };
    if (excludedCourseIds && excludedCourseIds.length > 0) {
      filter._id = { $nin: excludedCourseIds };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ enrollmentCount: -1, createdAt: -1 })
      .limit(limit)
      .select(
        'title slug thumbnail description difficultyLevel category rating enrollmentCount createdBy',
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return courses.map((c) => this.mapCourseToDto(c, 'Popular among students'));
  }

  async getRoleBasedCourses(
    roleId: string,
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]> {
    const role = await this.roleModel.findById(roleId).lean().exec();
    if (!role) {
      return [];
    }

    let categories: string[] = [];
    if (role.name === RoleEnum.STUDENT) {
      categories = ['Java', 'DSA', 'Web Dev', 'System Design'];
    } else {
      categories = [
        'Platform Management',
        'Analytics',
        'Placement Management',
        'Reports',
      ];
    }

    const filter: Record<string, any> = {
      status: CourseStatus.PUBLISHED,
      isActive: true,
      isDeleted: false,
      category: { $in: categories },
    };
    if (excludedCourseIds && excludedCourseIds.length > 0) {
      filter._id = { $nin: excludedCourseIds };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ enrollmentCount: -1 })
      .limit(limit)
      .select(
        'title slug thumbnail description difficultyLevel category rating enrollmentCount createdBy',
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return courses.map((c) =>
      this.mapCourseToDto(c, `Recommended for ${role.name}`),
    );
  }

  async getSkillBasedCourses(
    skills: string[],
    limit: number,
    excludedCourseIds?: any[],
  ): Promise<RecommendedCourseDto[]> {
    if (!skills || skills.length === 0) {
      return [];
    }

    const filter: Record<string, any> = {
      status: CourseStatus.PUBLISHED,
      isActive: true,
      isDeleted: false,
      tags: { $in: skills },
    };
    if (excludedCourseIds && excludedCourseIds.length > 0) {
      filter._id = { $nin: excludedCourseIds };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ rating: -1 })
      .limit(limit)
      .select(
        'title slug thumbnail description difficultyLevel category rating enrollmentCount createdBy',
      )
      .populate('createdBy', 'firstName lastName')
      .lean()
      .exec();

    return courses.map((c) => this.mapCourseToDto(c, 'Matches your skills'));
  }
}
