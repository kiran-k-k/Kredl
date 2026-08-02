import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {
  NotificationType,
  NotificationPriority,
} from '../../notifications/schemas/notification.schema';

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
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  actionUrl?: string;

  @ApiProperty()
  isRead: boolean;

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
