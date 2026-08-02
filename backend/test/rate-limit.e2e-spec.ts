import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import mongoose from 'mongoose';
import { EmailService } from '../src/modules/email/email.service';

jest.setTimeout(30000);

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendTemplateEmail: jest.fn().mockResolvedValue(true),
        sendVerificationEmail: jest.fn().mockResolvedValue(true),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (app) await app.close();
  });

  describe('Auth Rate Limiting', () => {
    it('should block excessive requests to /auth/login (429 Too Many Requests)', async () => {
      // The auth throttle limit is typically small (e.g., 5 or 10 requests)
      // We will make 15 requests rapidly
      let hit429 = false;

      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', '192.168.1.100') // Fixed IP to trigger rate limit
          .send({
            email: 'ratelimit@example.com',
            password: 'WrongPassword123!',
          });

        if (res.status === 429) {
          hit429 = true;
          break;
        }
      }

      expect(hit429).toBe(true);
    });
  });
});
