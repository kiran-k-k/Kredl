export interface EmailAttachment {
  filename?: string | false | undefined;
  content?: string | Buffer | undefined;
  path?: string | undefined;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}
