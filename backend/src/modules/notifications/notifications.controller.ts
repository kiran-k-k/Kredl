import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  NotificationListDto,
  NotificationQueryDto,
  NotificationResponseDto,
} from './dto/notification.dto';
import { CreateSystemNotificationDto } from './dto/create-system-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/schemas/role.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications for the current user' })
  @ApiResponse({ status: 200, type: NotificationListDto })
  async getNotifications(
    @Query() query: NotificationQueryDto,
    @CurrentUser() user: { sub: string },
  ): Promise<NotificationListDto> {
    return this.notificationsService.getUserNotifications(user.sub, query);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the 5 most recent notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getLatestNotifications(
    @CurrentUser() user: { sub: string },
  ): Promise<NotificationResponseDto[]> {
    return this.notificationsService.getLatestNotifications(user.sub, 5);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200 })
  async getUnreadCount(
    @CurrentUser() user: { sub: string },
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.sub);
    return { count };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 204 })
  async markAllAsRead(
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiResponse({ status: 204 })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Delete('read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: 204 })
  async deleteAllRead(
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.notificationsService.deleteAllRead(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a single notification' })
  @ApiResponse({ status: 204 })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<void> {
    return this.notificationsService.deleteNotification(user.sub, id);
  }

  // --- Admin APIs ---

  @Post('system')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Create a system/global notification (Admin only)' })
  @ApiResponse({ status: 201 })
  async createSystemNotification(
    @Body() dto: CreateSystemNotificationDto,
  ): Promise<void> {
    return this.notificationsService.createSystemNotification(dto);
  }
}
