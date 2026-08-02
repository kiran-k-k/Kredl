import { TemplateData } from '../interfaces/template-data.interface';

export const generateNotificationTemplate = (data: TemplateData): string => {
  const message =
    typeof data.message === 'string'
      ? data.message
      : 'You have a new notification.';
  const name = typeof data.name === 'string' ? data.name : 'User';
  const actionUrl =
    typeof data.actionUrl === 'string' ? data.actionUrl : undefined;

  let actionButton = '';
  if (actionUrl) {
    actionButton = `
      <p>
        <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Details
        </a>
      </p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Hi ${name},</h2>
      <p>${message}</p>
      ${actionButton}
      <br>
      <p>Best regards,</p>
      <p>The Kredl Team</p>
    </body>
    </html>
  `;
};
