import { TemplateData } from '../interfaces/template-data.interface';

export const generateVerificationTemplate = (data: TemplateData): string => {
  const verificationUrl =
    typeof data.verificationUrl === 'string' ? data.verificationUrl : '#';
  const name = typeof data.name === 'string' ? data.name : 'User';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Hi ${name},</h2>
      <p>Thank you for signing up for Kredl. Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <br>
      <p>Best regards,</p>
      <p>The Kredl Team</p>
    </body>
    </html>
  `;
};
