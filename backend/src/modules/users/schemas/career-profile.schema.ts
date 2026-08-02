import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CareerProfileDocument = CareerProfile & Document;

@Schema({
  timestamps: true,
  collection: 'career_profiles',
})
export class CareerProfile {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String })
  currentStatus?: string; // Student, Graduate, Working Professional, Career Switcher

  @Prop({ type: String })
  education?: string; // B.Tech, BCA, etc.

  @Prop({ type: String })
  branch?: string;

  @Prop({ type: Number })
  graduationYear?: number;

  @Prop({ type: [String], default: [] })
  preferredJobRoles: string[];

  @Prop({ type: [String], default: [] })
  preferredCompanies: string[];

  @Prop({ type: [String], default: [] })
  currentSkills: string[];

  @Prop({ type: String })
  skillLevel?: string; // Beginner, Intermediate, Advanced

  @Prop({ type: Number, min: 1, max: 10 })
  programmingConfidence?: number;

  @Prop({ type: String })
  dailyStudyGoal?: string; // 30 Minutes, 1 Hour, etc.

  @Prop({ type: String })
  learningStyle?: string; // Videos, Notes, Projects, Mixed

  @Prop({ type: [String], default: [] })
  preferredStudyTime: string[]; // Morning, Afternoon, Evening, Night

  @Prop({ type: String })
  placementGoal?: string; // Internship, 6+ LPA, Dream Company, etc.

  @Prop({ type: String })
  joiningTimeline?: string; // Immediately, 3 Months, 6 Months, 1 Year

  @Prop({ type: String })
  aptitudeLevel?: string;

  @Prop({ type: String })
  communicationLevel?: string;

  @Prop({ type: Boolean, default: false })
  resumeReady: boolean;

  @Prop({ type: String })
  githubProfile?: string;

  @Prop({ type: String })
  linkedinProfile?: string;

  @Prop({ type: String })
  portfolioWebsite?: string;
}

export const CareerProfileSchema = SchemaFactory.createForClass(CareerProfile);
