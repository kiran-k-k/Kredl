import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

export enum RoleEnum {
  STUDENT = 'Student',
  ADMIN = 'Admin',
  TPO = 'TPO',
  CONTENT_MANAGER = 'Content Manager',
  PLACEMENT_MANAGER = 'Placement Manager',
  MODERATOR = 'Moderator',
  SUPER_ADMIN = 'Super Admin',
}

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ type: String, enum: RoleEnum, required: true, unique: true })
  name: RoleEnum;

  @Prop({ type: [String], required: true, default: [] })
  permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
