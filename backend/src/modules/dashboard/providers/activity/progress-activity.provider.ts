/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseActivityProvider } from './base-activity.provider';
import {
  ActivityQueryDto,
  RecentActivityDto,
} from '../../dto/recent-activity.dto';
import { ActivityType } from '../../../../common/enums/activity-type.enum';
import {
  Progress,
  ProgressDocument,
} from '../../../progress/schemas/progress.schema';
import { ActivityMapper } from '../../mappers/activity.mapper';

@Injectable()
export class ProgressActivityProvider extends BaseActivityProvider {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
  ) {
    super();
  }

  async getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]> {
    if (
      query.activityType &&
      query.activityType !== ActivityType.RESUME_LEARNING &&
      query.activityType !== ActivityType.COURSE_COMPLETED
    ) {
      return [];
    }

    const userObjId = new Types.ObjectId(userId);
    const dateMatch = this.getDateMatch(query, 'lastAccessedAt');

    const results = await this.progressModel.aggregate([
      {
        $match: {
          userId: userObjId,
          ...dateMatch,
          ...(query.courseId && {
            courseId: new Types.ObjectId(query.courseId),
          }),
        },
      },
      { $sort: { lastAccessedAt: this.getSortDirection(query) } },
      { $limit: this.getLimit(query) },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          status: 1,
          updatedAt: 1,
          lastAccessedAt: 1,
          courseId: 1,
          lastAccessedModuleId: 1,
          percentage: 1,
          'course.title': 1,
        },
      },
    ]);

    return results.map((r) => ActivityMapper.mapProgressToActivity(r));
  }
}
