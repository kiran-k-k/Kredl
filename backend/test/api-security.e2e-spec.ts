import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { EmailService } from '../src/modules/email/email.service';
import { ThrottlerGuard } from '@nestjs/throttler';

jest.setTimeout(30000);

describe('API Security & Validation (e2e)', () => {
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
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    
    // We apply validation pipe to match main.ts
    // In main.ts, whitelist: true, forbidNonWhitelisted: true should be enabled for security
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (app) await app.close();
  });

  describe('DTO Validation and Payload Security', () => {
    it('should reject missing required fields (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          // missing password, firstName, lastName
        })
        .expect(400);

      expect(res.body.message).toBeInstanceOf(Array);
      expect(res.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('email must be an email'),
          expect.stringContaining('password should not be empty'),
          expect.stringContaining('firstName should not be empty'),
        ])
      );
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testvalidation@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'Validation',
          extraField: 'hacker123',
        })
        .expect(400);
      
      expect(res.body.message).toBeInstanceOf(Array);
      expect(res.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('property extraField should not exist'),
        ])
      );
    });
  });
});
