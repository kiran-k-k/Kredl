/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getModelToken } from '@nestjs/mongoose';
import { Notification } from './schemas/notification.schema';
import { Types } from 'mongoose';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let model: any;

  const mockNotification = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test notification',
    isRead: false,
    priority: 'low',
    createdAt: new Date(),
    metadata: { test: true },
  };

  const mockModel = {
    countDocuments: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    model = module.get(getModelToken(Notification.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return a paginated list of notifications', async () => {
      model.exec
        .mockResolvedValueOnce(1) // countDocuments
        .mockResolvedValueOnce([mockNotification]); // find

      const userId = new Types.ObjectId().toString();
      const result = await service.getUserNotifications(userId, {
        page: 1,
        limit: 10,
      });

      expect(model.countDocuments).toHaveBeenCalledWith({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { isGlobal: true },
        ],
        $and: [
          {
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: { $gt: expect.any(Date) } },
            ],
          },
        ],
      });
      expect(result.total).toBe(1);
      expect(result.notifications.length).toBe(1);
      expect(result.notifications[0].title).toBe('Test Notification');
    });
  });
});
