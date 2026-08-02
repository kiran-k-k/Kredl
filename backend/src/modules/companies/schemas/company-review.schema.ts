import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FLAGGED = 'FLAGGED',
  HIDDEN = 'HIDDEN',
}

@Schema({ timestamps: true })
export class CompanyReview extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String })
  pros?: string;

  @Prop({ type: String })
  cons?: string;

  @Prop({ type: String, required: true })
  placementExperience: string;

  @Prop({ type: String, enum: ReviewStatus, default: ReviewStatus.APPROVED })
  status: ReviewStatus;

  @Prop({ type: Boolean, default: false })
  isHidden: boolean; // Overrides status if true, useful for quick admin action
}

export const CompanyReviewSchema = SchemaFactory.createForClass(CompanyReview);

// Ensure a student can only review a company once
CompanyReviewSchema.index({ companyId: 1, studentId: 1 }, { unique: true });

// Optimize queries for finding approved reviews for a specific company
CompanyReviewSchema.index({ companyId: 1, status: 1, isHidden: 1 });
