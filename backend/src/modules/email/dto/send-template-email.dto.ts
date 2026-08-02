import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  IsObject,
} from 'class-validator';
import { EMAIL_MAX_SUBJECT_LENGTH } from '../email.constants';
import type { EmailAttachment } from '../interfaces/email-options.interface';
import type { TemplateData } from '../interfaces/template-data.interface';

export class SendTemplateEmailDto {
  @IsNotEmpty()
  to: string | string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(EMAIL_MAX_SUBJECT_LENGTH)
  subject: string;

  @IsNotEmpty()
  templateName:
    | 'welcome'
    | 'email-verification'
    | 'password-reset'
    | 'notification'
    | 'invite';

  @IsObject()
  templateData: TemplateData;

  @IsOptional()
  cc?: string | string[];

  @IsOptional()
  bcc?: string | string[];

  @IsOptional()
  replyTo?: string | string[];

  @IsOptional()
  @IsArray()
  attachments?: EmailAttachment[];

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}
