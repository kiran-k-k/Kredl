import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
  DELETED = 'DELETED',
}

@Schema({ _id: false })
export class CareerGoal {
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobRole' })
  jobRoleId?: Types.ObjectId;

  @Prop({ type: Date })
  selectedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isCompleted?: boolean;
}

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  })
  email: string;

  @Exclude()
  @Prop({ type: String })
  passwordHash?: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'College', index: true })
  collegeId?: Types.ObjectId;

  @Prop({ type: Number })
  graduationYear?: number;

  @Prop({ type: String, trim: true, index: true })
  department?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  bio?: string;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
    required: true,
    index: true,
  })
  status: UserStatus;

  @Prop({ type: Number, default: 0 })
  tokenVersion: number;

  @Exclude()
  @Prop({ type: String })
  hashedRefreshToken?: string;

  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({
    type: [{ type: String, enum: AuthProvider }],
    default: [AuthProvider.EMAIL],
    index: true,
  })
  providers: AuthProvider[];

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Prop({ type: String })
  emailVerificationTokenHash?: string;

  @Prop({ type: Date })
  emailVerificationTokenExpiresAt?: Date;

  @Exclude()
  @Prop({ type: String })
  passwordResetTokenHash?: string;

  @Prop({ type: Date })
  passwordResetTokenExpiresAt?: Date;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date })
  lockedUntil?: Date;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: String })
  lastLoginIp?: string;

  @Prop({ type: String })
  lastLoginUserAgent?: string;

  @Prop({ type: Date })
  lastPasswordChangedAt?: Date;

  @Prop({ type: String })
  profileImage?: string;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  @Prop({ type: CareerGoal })
  careerGoal?: CareerGoal;

  @Prop({ type: Boolean, default: false })
  profileCompleted: boolean;

  @Prop({ type: Number, default: 0 })
  learningStreak: number;

  @Prop({ type: Date })
  lastLearnedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});
