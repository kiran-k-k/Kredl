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
  ModuleCompletion,
  ModuleCompletionDocument,
  ModuleStatus,
} from '../../../progress/schemas/module-completion.schema';
import { ActivityMapper } from '../../mappers/activity.mapper';

@Injectable()
export class ModuleCompletionActivityProvider extends BaseActivityProvider {
  constructor(
    @InjectModel(ModuleCompletion.name)
    private moduleCompletionModel: Model<ModuleCompletionDocument>,
  ) {
    super();
  }

  async getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]> {
    if (
      query.activityType &&
      query.activityType !== ActivityType.MODULE_COMPLETED
    ) {
      return [];
    }

    const userObjId = new Types.ObjectId(userId);
    const dateMatch = this.getDateMatch(query, 'completedAt');

    const results = await this.moduleCompletionModel.aggregate([
      {
        $match: {
          userId: userObjId,
          status: ModuleStatus.COMPLETED,
          ...dateMatch,
          ...(query.courseId && {
            courseId: new Types.ObjectId(query.courseId),
          }),
        },
      },
      { $sort: { completedAt: this.getSortDirection(query) } },
      { $limit: this.getLimit(query) },
      {
        $lookup: {
          from: 'coursemodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module',
        },
      },
      { $unwind: { path: '$module', preserveNullAndEmptyArrays: true } },
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
          completedAt: 1,
          updatedAt: 1,
          courseId: 1,
          moduleId: 1,
          quizScore: 1,
          'module.title': 1,
          'course.title': 1,
        },
      },
    ]);

    return results.map((r) => ActivityMapper.mapModuleCompletionToActivity(r));
  }
}
