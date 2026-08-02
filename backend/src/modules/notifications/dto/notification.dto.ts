import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../schemas/notification.schema';

export class NotificationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @ApiProperty({ required: false, enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
  
  @ApiProperty({ required: false, enum: NotificationCategory })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationCategory })
  category: NotificationCategory;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  actionUrl?: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ required: false })
  isGlobal?: boolean;

  @ApiProperty({ enum: NotificationPriority })
  priority: NotificationPriority;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;
}

export class NotificationListDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  notifications: NotificationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasMore: boolean;
}
