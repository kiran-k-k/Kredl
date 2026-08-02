import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { RESEND_CLIENT } from './email.constants';
import { getEmailConfig } from './email.config';
import { Logger } from '@nestjs/common';

export const EmailProvider = {
  provide: RESEND_CLIENT,
  useFactory: (configService: ConfigService) => {
    const logger = new Logger('EmailProvider');
    try {
      const config = getEmailConfig(configService);
      const resendClient = new Resend(config.apiKey);
      logger.log('Resend Provider initialized successfully');
      return resendClient;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error(`Configuration error: ${err.message}`);
      throw err;
    }
  },
  inject: [ConfigService],
};
