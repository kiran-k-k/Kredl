import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);

      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash('WrongPassword!', 10);

      const result = await service.comparePassword(password, hash);
      expect(result).toBe(false);
    });
  });

  describe('hashRefreshToken', () => {
    it('should hash a refresh token', async () => {
      const token = 'random_refresh_token_string';
      const hash = await service.hashRefreshToken(token);

      expect(hash).not.toBe(token);
      const isMatch = await bcrypt.compare(token, hash);
      expect(isMatch).toBe(true);
    });
  });

  describe('compareRefreshToken', () => {
    it('should return true for correct refresh token', async () => {
      const token = 'random_refresh_token_string';
      const hash = await bcrypt.hash(token, 10);

      const result = await service.compareRefreshToken(token, hash);
      expect(result).toBe(true);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a 64-character hex string by default (32 bytes)', () => {
      const token = service.generateRandomToken();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
    });

    it('should generate a string of length based on specified bytes', () => {
      const token = service.generateRandomToken(16);
      expect(token).toHaveLength(32);
    });
  });

  describe('hashToken', () => {
    it('should generate a sha256 hash', () => {
      const token = 'my-token';
      const hash = service.hashToken(token);

      const expectedHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      expect(hash).toBe(expectedHash);
      expect(hash).toHaveLength(64);
    });
  });
});
