import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { SECURITY_CONFIG } from '../../../config/security.config';

@Injectable()
export class PasswordService {
  private readonly saltRounds = SECURITY_CONFIG.PASSWORD?.SALT_ROUNDS || 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return bcrypt.hash(refreshToken, this.saltRounds);
  }

  async compareRefreshToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
