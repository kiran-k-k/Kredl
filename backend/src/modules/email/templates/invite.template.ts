import { TemplateData } from '../interfaces/template-data.interface';

export const generateInviteTemplate = (data: TemplateData): string => {
  const email = typeof data.email === 'string' ? data.email : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const role = typeof data.role === 'string' ? data.role : 'Student';
  const loginUrl = typeof data.loginUrl === 'string' ? data.loginUrl : 'http://localhost:3000/auth/login';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>You've been invited to Kredl!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Welcome to Kredl!</h2>
      <p>You have been invited to join Kredl as a <strong>${role}</strong>.</p>
      <p>Here are your temporary login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <div style="margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to your account</a>
      </div>
      <br>
      <p>Best regards,</p>
      <p>The Kredl Team</p>
    </body>
    </html>
  `;
};
