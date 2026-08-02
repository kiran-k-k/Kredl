import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bookmark, BookmarkType } from './schemas/bookmark.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Job } from '../jobs/schemas/job.schema';
import { Company } from '../companies/schemas/company.schema';
import { JobRole } from '../job-roles/schemas/job-role.schema';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<any>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<Job>,
    @InjectModel(Company.name)
    private readonly companyModel: Model<Company>,
    @InjectModel(JobRole.name)
    private readonly jobRoleModel: Model<JobRole>,
  ) {}

  async getBookmarks(userId: string) {
    const bookmarks = await this.bookmarkModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    // Fetch courses
    const courseIds = bookmarks
      .filter((b) => b.entityType === BookmarkType.COURSE)
      .map((b) => b.entityId);

    let courses: any[] = [];
    if (courseIds.length > 0) {
      courses = await this.courseModel
        .find({ _id: { $in: courseIds } })
        .lean()
        .exec();
    }
    const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

    // Fetch jobs
    const jobIds = bookmarks
      .filter((b) => b.entityType === BookmarkType.JOB)
      .map((b) => b.entityId);

    let jobs: any[] = [];
    if (jobIds.length > 0) {
      jobs = await this.jobModel
        .find({ _id: { $in: jobIds } })
        .populate('companyId', 'name logo')
        .populate('roleId', 'title')
        .lean()
        .exec();
    }
    const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

    // Fetch companies
    const companyIds = bookmarks
      .filter((b) => b.entityType === BookmarkType.COMPANY)
      .map((b) => b.entityId);

    let companies: any[] = [];
    if (companyIds.length > 0) {
      companies = await this.companyModel
        .find({ _id: { $in: companyIds } })
        .lean()
        .exec();
    }
    const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

    // Fetch roles
    const roleIds = bookmarks
      .filter((b) => b.entityType === BookmarkType.ROLE)
      .map((b) => b.entityId);

    let roles: any[] = [];
    if (roleIds.length > 0) {
      roles = await this.jobRoleModel
        .find({ _id: { $in: roleIds } })
        .lean()
        .exec();
    }
    const roleMap = new Map(roles.map((r) => [r._id.toString(), r]));

    return bookmarks.map((b) => {
      if (b.entityType === BookmarkType.COURSE) {
        const course = courseMap.get(b.entityId.toString());
        return {
          id: b._id.toString(),
          type: b.entityType,
          title: course ? course.title : 'Unknown Course',
          subtitle: course ? course.shortDescription : '',
          entityId: b.entityId.toString(),
          createdAt: b.createdAt,
        };
      }
      if (b.entityType === BookmarkType.JOB) {
        const job = jobMap.get(b.entityId.toString());
        return {
          id: b._id.toString(),
          type: b.entityType,
          title: job ? job.title : 'Unknown Job',
          subtitle: job && job.companyId ? job.companyId.name : '',
          entityId: b.entityId.toString(),
          createdAt: b.createdAt,
        };
      }
      if (b.entityType === BookmarkType.COMPANY) {
        const company = companyMap.get(b.entityId.toString());
        return {
          id: b._id.toString(),
          type: b.entityType,
          title: company ? company.name : 'Unknown Company',
          subtitle: company ? (company.industry || company.location || '') : '',
          entityId: b.entityId.toString(),
          createdAt: b.createdAt,
        };
      }
      if (b.entityType === BookmarkType.ROLE) {
        const role = roleMap.get(b.entityId.toString());
        return {
          id: b._id.toString(),
          type: b.entityType,
          title: role ? role.title : 'Unknown Role',
          subtitle: role ? role.category : '',
          entityId: b.entityId.toString(),
          createdAt: b.createdAt,
        };
      }
      return {
        id: b._id.toString(),
        type: b.entityType,
        title: 'Saved ' + b.entityType,
        subtitle: 'Details pending',
        entityId: b.entityId.toString(),
        createdAt: b.createdAt,
      };
    });
  }

  async toggleBookmark(
    userId: string,
    entityId: string,
    entityType: BookmarkType,
  ) {
    const existing = await this.bookmarkModel.findOne({
      userId: new Types.ObjectId(userId),
      entityId: new Types.ObjectId(entityId),
      entityType,
    });

    if (existing) {
      await this.bookmarkModel.deleteOne({ _id: existing._id });
      return { bookmarked: false };
    } else {
      await this.bookmarkModel.create({
        userId: new Types.ObjectId(userId),
        entityId: new Types.ObjectId(entityId),
        entityType,
      });
      return { bookmarked: true };
    }
  }

  async deleteBookmark(userId: string, id: string) {
    const result = await this.bookmarkModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Bookmark not found');
    }
    return { success: true };
  }
}
