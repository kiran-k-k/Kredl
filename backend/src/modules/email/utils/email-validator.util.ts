import { BadRequestException } from '@nestjs/common';
import { EMAIL_MAX_SUBJECT_LENGTH } from '../email.constants';
import { SendEmailOptionsDto } from '../dto/send-email-options.dto';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmailAddress = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validateEmailList = (emails: string | string[]): void => {
  const emailArray = Array.isArray(emails) ? emails : [emails];

  if (emailArray.length === 0) {
    throw new BadRequestException('Recipient list cannot be empty');
  }

  for (const email of emailArray) {
    if (!validateEmailAddress(email)) {
      throw new BadRequestException(`Invalid email address: ${email}`);
    }
  }
};

export const validateSendEmailOptions = (
  options: SendEmailOptionsDto,
): void => {
  if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
    throw new BadRequestException('Recipient (to) is required');
  }

  validateEmailList(options.to);

  if (options.cc) {
    validateEmailList(options.cc);
  }

  if (options.bcc) {
    validateEmailList(options.bcc);
  }

  if (options.replyTo) {
    validateEmailList(options.replyTo);
  }

  if (!options.subject || options.subject.trim() === '') {
    throw new BadRequestException('Subject is required');
  }

  if (options.subject.length > EMAIL_MAX_SUBJECT_LENGTH) {
    throw new BadRequestException(
      `Subject exceeds maximum length of ${EMAIL_MAX_SUBJECT_LENGTH} characters`,
    );
  }

  if (!options.html || options.html.trim() === '') {
    throw new BadRequestException('HTML content is required');
  }
};
