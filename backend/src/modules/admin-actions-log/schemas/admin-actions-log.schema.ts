import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AdminActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  IMPERSONATE = 'IMPERSONATE',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AdminActionsLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ type: String, enum: AdminActionType, required: true })
  actionType: AdminActionType;

  @Prop({ required: true, trim: true })
  targetEntity: string;

  @Prop({ type: Types.ObjectId })
  targetEntityId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const AdminActionsLogSchema =
  SchemaFactory.createForClass(AdminActionsLog);

// --- Indexing Strategy ---
AdminActionsLogSchema.index({ adminId: 1, createdAt: -1 });
AdminActionsLogSchema.index({ actionType: 1, createdAt: -1 });
AdminActionsLogSchema.index({ targetEntity: 1, targetEntityId: 1 });
AdminActionsLogSchema.index({ createdAt: -1 });
