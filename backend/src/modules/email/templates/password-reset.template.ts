import { TemplateData } from '../interfaces/template-data.interface';

export const generatePasswordResetTemplate = (data: TemplateData): string => {
  const resetUrl = typeof data.resetUrl === 'string' ? data.resetUrl : '#';
  const name = typeof data.name === 'string' ? data.name : 'User';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset your password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>Click the link below to set a new password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <br>
      <p>Best regards,</p>
      <p>The Kredl Team</p>
    </body>
    </html>
  `;
};
