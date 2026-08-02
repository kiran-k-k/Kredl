import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { RESEND_CLIENT } from './email.constants';
import { getEmailConfig } from './email.config';
import { SendEmailOptionsDto } from './dto/send-email-options.dto';
import { SendTemplateEmailDto } from './dto/send-template-email.dto';
import { EmailResponseDto } from './dto/email-response.dto';
import { validateSendEmailOptions } from './utils/email-validator.util';
import { renderTemplate } from './utils/template-renderer.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultFrom: string;

  constructor(
    @Inject(RESEND_CLIENT) private readonly resendClient: Resend,
    private readonly configService: ConfigService,
  ) {
    const config = getEmailConfig(this.configService);
    this.defaultFrom = config.defaultFrom;
  }

  async sendEmail(options: SendEmailOptionsDto): Promise<EmailResponseDto> {
    try {
      validateSendEmailOptions(options);

      const payload = {
        from: this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc
            : [options.cc]
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc
            : [options.bcc]
          : undefined,
        replyTo: options.replyTo
          ? Array.isArray(options.replyTo)
            ? options.replyTo
            : [options.replyTo]
          : undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attachments: options.attachments as any,
        headers: options.headers,
      };

      if (this.configService.get<string>('RESEND_API_KEY') === 'dummy_resend_key') {
        this.logger.log('====================================');
        this.logger.log(`[MOCK EMAIL SENT] To: ${options.to}`);
        this.logger.log(`Subject: ${options.subject}`);
        this.logger.log(`Content:\n${options.html || options.text}`);
        this.logger.log('====================================');
        
        return {
          success: true,
          messageId: 'mock-id-123',
          provider: 'mock',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await this.resendClient.emails.send(payload);

      if (response.error) {
        throw new BadRequestException(response.error.message);
      }

      this.logger.log(
        `Email sent successfully: ${response.data?.id || 'unknown ID'}`,
      );

      return {
        success: true,
        messageId: response.data?.id,
        provider: 'resend',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Email sending failed: ${err.message}`);
      throw new BadRequestException(`Failed to send email: ${err.message}`);
    }
  }

  async sendTemplateEmail(
    options: SendTemplateEmailDto,
  ): Promise<EmailResponseDto> {
    try {
      const htmlContent = renderTemplate(
        options.templateName,
        options.templateData,
      );

      const emailOptions: SendEmailOptionsDto = {
        to: options.to,
        subject: options.subject,
        html: htmlContent,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments,
        headers: options.headers,
      };

      return await this.sendEmail(emailOptions);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Template email sending failed: ${err.message}`);
      throw new BadRequestException(
        `Failed to process template email: ${err.message}`,
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // Assuming simple call to fetch domains to check if API key is valid
      const result = await this.resendClient.domains.list();
      if (result.error) {
        this.logger.error(`Verify Connection failed: ${result.error.message}`);
        return false;
      }
      this.logger.log('Resend connection verified successfully');
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Verify connection failed: ${err.message}`);
      return false;
    }
  }
}
