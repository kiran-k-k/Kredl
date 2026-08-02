import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

/**
 * Base schema class providing Audit Metadata and Soft Delete capabilities.
 * All domain schemas that require these capabilities should extend this class.
 */
@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt
export class BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  // Soft Delete metadata
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;
}
