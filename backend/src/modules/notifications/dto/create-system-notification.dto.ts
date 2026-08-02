import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '../schemas/notification.schema';

export enum TargetAudience {
  ALL_STUDENTS = 'ALL_STUDENTS',
  SPECIFIC_USERS = 'SPECIFIC_USERS',
  // Future extensibility for role-based targeting can be added here (e.g. BY_ROLE)
}

export class CreateSystemNotificationDto {
  @ApiProperty({ enum: TargetAudience })
  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @ApiPropertyOptional({
    description: 'Array of user IDs if targetAudience is SPECIFIC_USERS',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUserIds?: string[];

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.GENERAL })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType = NotificationType.GENERAL;

  @ApiProperty({ enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory = NotificationCategory.SYSTEM;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.MEDIUM;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
