import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PlacementDrive extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  title: string; // e.g., "Google On-Campus Drive 2025"

  @Prop({ type: Object, required: true })
  eligibilityCriteria: {
    minimumCgpa: number;
    allowedBranches: string[];
    batchYears: number[];
  };

  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  selectedStudents: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  })
  driveStatus: string;
}
export const PlacementDriveSchema =
  SchemaFactory.createForClass(PlacementDrive);

// --- Indexing Strategy ---
PlacementDriveSchema.index({ companyId: 1, driveStatus: 1 });
