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
  QuizAttempt,
  QuizAttemptDocument,
} from '../../../quiz/schemas/quiz-attempt.schema';
import { ActivityMapper } from '../../mappers/activity.mapper';

@Injectable()
export class QuizActivityProvider extends BaseActivityProvider {
  constructor(
    @InjectModel(QuizAttempt.name)
    private quizAttemptModel: Model<QuizAttemptDocument>,
  ) {
    super();
  }

  async getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]> {
    if (
      query.activityType &&
      query.activityType !== ActivityType.QUIZ_PASSED &&
      query.activityType !== ActivityType.QUIZ_FAILED
    ) {
      return [];
    }

    const userObjId = new Types.ObjectId(userId);
    const dateMatch = this.getDateMatch(query, 'submittedAt');

    const results = await this.quizAttemptModel.aggregate([
      { $match: { userId: userObjId, ...dateMatch } },
      { $sort: { submittedAt: this.getSortDirection(query) } },
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
          localField: 'module.courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $match: query.courseId
          ? { 'module.courseId': new Types.ObjectId(query.courseId) }
          : {},
      },
      {
        $project: {
          _id: 1,
          passed: 1,
          submittedAt: 1,
          moduleId: 1,
          score: 1,
          percentage: 1,
          attemptNumber: 1,
          timeTakenSeconds: 1,
          'module.title': 1,
          'module.courseId': 1,
          'course.title': 1,
        },
      },
    ]);

    return results.map((r) => ActivityMapper.mapQuizAttemptToActivity(r));
  }
}
