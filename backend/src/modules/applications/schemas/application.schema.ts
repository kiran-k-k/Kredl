import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApplicationStatus {
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  SELECTED = 'selected',
}

@Schema({ timestamps: true })
export class Application extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlacementDrive' })
  driveId?: Types.ObjectId; // If applied via a campus drive

  @Prop({
    type: String,
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @Prop({ type: String, required: true })
  resumeSnapshotUrl: string; // S3/Cloudinary URL to the exact resume used

  @Prop({ type: Date, default: Date.now })
  appliedAt: Date;
}
export const ApplicationSchema = SchemaFactory.createForClass(Application);

// --- Indexing Strategy ---
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ jobId: 1, status: 1 });
