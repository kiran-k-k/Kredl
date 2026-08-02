import { TemplateData } from '../interfaces/template-data.interface';

export const generateWelcomeTemplate = (data: TemplateData): string => {
  const name = typeof data.name === 'string' ? data.name : 'User';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Kredl</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Welcome to Kredl, ${name}!</h2>
      <p>We are thrilled to have you on board. Kredl is your ultimate platform for learning and career growth.</p>
      <p>Get started by exploring our courses and updating your profile.</p>
      <br>
      <p>Best regards,</p>
      <p>The Kredl Team</p>
    </body>
    </html>
  `;
};
