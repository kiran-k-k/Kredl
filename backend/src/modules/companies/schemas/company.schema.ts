import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Company extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true })
  logo: string; // Cloudinary URL

  @Prop()
  website?: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ type: [String], default: [] })
  hiringProcess: string[];

  @Prop({ type: [String], default: [] })
  interviewRounds: string[];

  @Prop({ type: Object })
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };

  @Prop({ type: Object })
  eligibilityCriteria: {
    minimumCgpa: number;
    allowedBranches: string[];
    requiredSkills: string[];
  };

  @Prop({ type: [{ question: String, answer: String }], default: [] })
  faqs: { question: string; answer: string }[];

  @Prop({ type: [String], default: [] })
  preparationTips: string[];

  // Virtuals for relationships
  relatedJobRoles?: Types.ObjectId[];
  jobOpenings?: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.virtual('relatedJobRoles', {
  ref: 'JobRole',
  localField: '_id',
  foreignField: 'companiesHiring',
});

CompanySchema.virtual('jobOpenings', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId',
});

// --- Indexing Strategy ---
CompanySchema.index({ name: 'text', overview: 'text' });
