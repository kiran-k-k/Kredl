import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyReview, ReviewStatus } from './schemas/company-review.schema';
import {
  CreateCompanyReviewDto,
  ModerateCompanyReviewDto,
  UpdateCompanyReviewDto,
} from './dto/company-review.dto';
import {
  AdminActionsLog,
  AdminActionType,
} from '../admin-actions-log/schemas/admin-actions-log.schema';

@Injectable()
export class CompanyReviewsService {
  constructor(
    @InjectModel(CompanyReview.name)
    private readonly reviewModel: Model<CompanyReview>,
    @InjectModel(AdminActionsLog.name)
    private readonly adminLogModel: Model<AdminActionsLog>,
  ) {}

  private async logAdminAction(
    adminId: string,
    actionType: AdminActionType,
    targetEntityId?: string,
    metadata?: Record<string, any>,
  ) {
    if (!adminId) return;
    try {
      await this.adminLogModel.create({
        adminId: new Types.ObjectId(adminId),
        actionType,
        targetEntity: 'CompanyReview',
        targetEntityId: targetEntityId ? new Types.ObjectId(targetEntityId) : undefined,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  async create(
    companyId: string,
    studentId: string,
    createReviewDto: CreateCompanyReviewDto,
  ): Promise<CompanyReview> {
    const existing = await this.reviewModel.findOne({
      companyId: new Types.ObjectId(companyId),
      studentId: new Types.ObjectId(studentId),
    }).exec();

    if (existing) {
      throw new ConflictException('You have already reviewed this company.');
    }

    const review = new this.reviewModel({
      ...createReviewDto,
      companyId: new Types.ObjectId(companyId),
      studentId: new Types.ObjectId(studentId),
      status: ReviewStatus.APPROVED, // Auto-approve by default for now
    });

    return review.save();
  }

  async update(
    reviewId: string,
    studentId: string,
    updateReviewDto: UpdateCompanyReviewDto,
  ): Promise<CompanyReview> {
    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.studentId.toString() !== studentId) {
      throw new ForbiddenException('You can only edit your own reviews.');
    }

    Object.assign(review, updateReviewDto);
    return review.save();
  }

  async removeAsStudent(reviewId: string, studentId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.studentId.toString() !== studentId) {
      throw new ForbiddenException('You can only delete your own reviews.');
    }
    await this.reviewModel.findByIdAndDelete(reviewId).exec();
  }

  async findAllForCompany(
    companyId: string,
    query: { page?: number; limit?: number },
    isAdmin: boolean = false,
  ) {
    const { limit = 10 } = query;
    const page = Math.max(1, query.page ?? 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { companyId: new Types.ObjectId(companyId) };
    if (!isAdmin) {
      filter.status = ReviewStatus.APPROVED;
      filter.isHidden = false;
    }

    const [data, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName avatar')
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  // --- Admin Methods ---

  async removeAsAdmin(reviewId: string, adminId: string): Promise<void> {
    const review = await this.reviewModel.findByIdAndDelete(reviewId).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.logAdminAction(adminId, AdminActionType.DELETE, reviewId, { deletedByAdmin: true });
  }

  async moderate(
    reviewId: string,
    moderateDto: ModerateCompanyReviewDto,
    adminId: string,
  ): Promise<CompanyReview> {
    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (moderateDto.status) review.status = moderateDto.status;
    if (moderateDto.isHidden !== undefined) review.isHidden = moderateDto.isHidden;

    const saved = await review.save();
    await this.logAdminAction(adminId, AdminActionType.UPDATE, reviewId, moderateDto);
    return saved;
  }

  async getFlaggedReviews(query: { page?: number; limit?: number }) {
    const { limit = 10 } = query;
    const page = Math.max(1, query.page ?? 1);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ status: ReviewStatus.FLAGGED }, { isHidden: true }],
    };

    const [data, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName')
        .populate('companyId', 'name')
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }
}
