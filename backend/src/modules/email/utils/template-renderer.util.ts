import { generateWelcomeTemplate } from '../templates/welcome.template';
import { generateVerificationTemplate } from '../templates/email-verification.template';
import { generatePasswordResetTemplate } from '../templates/password-reset.template';
import { generateNotificationTemplate } from '../templates/notification.template';
import { generateInviteTemplate } from '../templates/invite.template';
import { TemplateData } from '../interfaces/template-data.interface';
import { BadRequestException } from '@nestjs/common';

export const renderTemplate = (
  templateName:
    | 'welcome'
    | 'email-verification'
    | 'password-reset'
    | 'notification'
    | 'invite',
  data: TemplateData,
): string => {
  switch (templateName) {
    case 'welcome':
      return generateWelcomeTemplate(data);
    case 'email-verification':
      return generateVerificationTemplate(data);
    case 'password-reset':
      return generatePasswordResetTemplate(data);
    case 'notification':
      return generateNotificationTemplate(data);
    case 'invite':
      return generateInviteTemplate(data);
    default:
      throw new BadRequestException(
        `Unknown template: ${templateName as string}`,
      );
  }
};
