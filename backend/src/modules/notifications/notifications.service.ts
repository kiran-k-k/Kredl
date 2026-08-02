import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationCategory,
} from './schemas/notification.schema';
import {
  NotificationQueryDto,
  NotificationListDto,
  NotificationResponseDto,
} from './dto/notification.dto';
import { CreateSystemNotificationDto, TargetAudience } from './dto/create-system-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Internal method to create a single notification for a specific user
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(data.userId),
      isGlobal: false,
      type: data.type,
      category: data.category,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
    });
    return notification.save();
  }

  /**
   * Admin method to create system/global notifications
   */
  async createSystemNotification(dto: CreateSystemNotificationDto): Promise<void> {
    if (dto.targetAudience === TargetAudience.ALL_STUDENTS) {
      // Create a single global notification
      const notification = new this.notificationModel({
        isGlobal: true,
        type: dto.type,
        category: dto.category,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
        priority: dto.priority,
        metadata: dto.metadata,
      });
      await notification.save();
    } else if (dto.targetAudience === TargetAudience.SPECIFIC_USERS && dto.targetUserIds?.length) {
      // Bulk insert for specific users
      const docs = dto.targetUserIds.map((userId) => ({
        userId: new Types.ObjectId(userId),
        isGlobal: false,
        type: dto.type,
        category: dto.category,
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl,
        priority: dto.priority,
        metadata: dto.metadata,
      }));
      await this.notificationModel.insertMany(docs);
    }
  }

  /**
   * Get paginated notifications (including global) for a user
   */
  async getUserNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<NotificationListDto> {
    const { page = 1, limit = 20, unreadOnly, type, category } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { isGlobal: true },
      ],
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }

    const [total, notifications] = await Promise.all([
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    const mappedNotifications: NotificationResponseDto[] = notifications.map(
      (n: any) => ({
        id: n._id.toString(),
        type: n.type,
        category: n.category,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        isGlobal: n.isGlobal,
        priority: n.priority,
        createdAt: n.createdAt,
        metadata: n.metadata,
      }),
    );

    return {
      notifications: mappedNotifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    };
  }

  /**
   * Get latest notifications (limit 5)
   */
  async getLatestNotifications(userId: string, limit = 5): Promise<NotificationResponseDto[]> {
    const filter: Record<string, any> = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { isGlobal: true },
      ],
    };

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return notifications.map((n: any) => ({
        id: n._id.toString(),
        type: n.type,
        category: n.category,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        isGlobal: n.isGlobal,
        priority: n.priority,
        createdAt: n.createdAt,
        metadata: n.metadata,
    }));
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const filter: Record<string, any> = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { isGlobal: true }, // Ideally global read states are tracked, but here we count them as unread if they exist
      ],
      isRead: false,
    };
    return this.notificationModel.countDocuments(filter).exec();
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    // For personal notifications
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();

    if (!result) {
      // If it's a global notification, we can't easily mark it read for just ONE user 
      // without a separate read-state tracking collection.
      // We will skip marking global as read to avoid affecting other students.
      // This is a known trade-off for not duplicating 100k docs.
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    }).exec();
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
      isRead: true,
    }).exec();
  }
}
