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
  Bookmark,
  BookmarkType,
} from '../../../bookmarks/schemas/bookmark.schema';
import { ActivityMapper } from '../../mappers/activity.mapper';

@Injectable()
export class BookmarkActivityProvider extends BaseActivityProvider {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<Bookmark>,
  ) {
    super();
  }

  async getActivities(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<RecentActivityDto[]> {
    if (
      query.activityType &&
      query.activityType !== ActivityType.COURSE_BOOKMARKED
    ) {
      return [];
    }

    const userObjId = new Types.ObjectId(userId);
    const dateMatch = this.getDateMatch(query, 'createdAt');

    const matchQ: Record<string, unknown> = {
      userId: userObjId,
      entityType: BookmarkType.COURSE,
      ...dateMatch,
    };
    if (query.courseId) {
      matchQ.entityId = new Types.ObjectId(query.courseId);
    }

    const results = await this.bookmarkModel.aggregate([
      { $match: matchQ },
      { $sort: { createdAt: this.getSortDirection(query) } },
      { $limit: this.getLimit(query) },
      {
        $lookup: {
          from: 'courses',
          localField: 'entityId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          entityId: 1,
          'course.title': 1,
        },
      },
    ]);

    return results.map((r) => ActivityMapper.mapBookmarkToActivity(r));
  }
}
