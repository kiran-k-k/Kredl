import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { RESEND_CLIENT } from './email.constants';

// Mock the template renderer
jest.mock('./utils/template-renderer.util', () => ({
  renderTemplate: jest.fn().mockReturnValue('<html>MOCKED TEMPLATE</html>'),
}));

// Mock the validator to avoid throwing errors on simple mock options
jest.mock('./utils/email-validator.util', () => ({
  validateSendEmailOptions: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;

  const mockResendClient = {
    emails: {
      send: jest.fn(),
    },
    domains: {
      list: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'EMAIL_FROM') return 'test@example.com';
      if (key === 'EMAIL_FROM_NAME') return 'Kredl';
      if (key === 'RESEND_API_KEY') return 're_test_key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: RESEND_CLIENT,
          useValue: mockResendClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'msg_123' },
        error: null,
      });

      const options = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      };

      const result = await service.sendEmail(options);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Kredl <test@example.com>',
          to: ['user@example.com'],
          subject: 'Test Subject',
          html: '<p>Test</p>',
        })
      );
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_123');
    });

    it('should handle cc, bcc, and replyTo correctly (arrays)', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'msg_123' },
        error: null,
      });

      const options = {
        to: ['user1@example.com'],
        subject: 'Test',
        html: 'Test',
        cc: 'cc@example.com',
        bcc: ['bcc@example.com'],
        replyTo: 'reply@example.com',
      };

      await service.sendEmail(options);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@example.com'],
          cc: ['cc@example.com'],
          bcc: ['bcc@example.com'],
          replyTo: ['reply@example.com'],
        })
      );
    });

    it('should throw BadRequestException if Resend API returns an error object', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      });

      await expect(service.sendEmail({ to: 'test@example.com', subject: 'test' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if send throws an exception', async () => {
      mockResendClient.emails.send.mockRejectedValue(new Error('Network error'));

      await expect(service.sendEmail({ to: 'test@example.com', subject: 'test' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendTemplateEmail', () => {
    it('should render template and send email', async () => {
      mockResendClient.emails.send.mockResolvedValue({
        data: { id: 'msg_123' },
        error: null,
      });

      const options = {
        to: 'user@example.com',
        subject: 'Welcome',
        templateName: 'welcome',
        templateData: { name: 'John' },
      };

      const result = await service.sendTemplateEmail(options);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<html>MOCKED TEMPLATE</html>',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException if rendering or sending fails', async () => {
      mockResendClient.emails.send.mockRejectedValue(new Error('Send failed'));

      await expect(
        service.sendTemplateEmail({ to: 'user@example.com', subject: 'Welcome', templateName: 'welcome' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyConnection', () => {
    it('should return true if connection is valid', async () => {
      mockResendClient.domains.list.mockResolvedValue({ data: [], error: null });

      const result = await service.verifyConnection();
      expect(result).toBe(true);
    });

    it('should return false if API returns error', async () => {
      mockResendClient.domains.list.mockResolvedValue({ data: null, error: { message: 'Forbidden' } });

      const result = await service.verifyConnection();
      expect(result).toBe(false);
    });

    it('should return false if API throws an exception', async () => {
      mockResendClient.domains.list.mockRejectedValue(new Error('Network error'));

      const result = await service.verifyConnection();
      expect(result).toBe(false);
    });
  });
});
