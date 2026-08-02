import { ConfigService } from '@nestjs/config';

export const getEmailConfig = (configService: ConfigService) => {
  const apiKey = configService.get<string>('RESEND_API_KEY');
  const emailFrom = configService.get<string>('EMAIL_FROM');
  const emailFromName = configService.get<string>('EMAIL_FROM_NAME') || 'Kredl';

  if (!apiKey) {
    throw new Error('Resend configuration error: RESEND_API_KEY is missing');
  }

  if (!emailFrom) {
    throw new Error('Resend configuration error: EMAIL_FROM is missing');
  }

  return {
    apiKey,
    emailFrom,
    emailFromName,
    defaultFrom: `${emailFromName} <${emailFrom}>`,
  };
};
