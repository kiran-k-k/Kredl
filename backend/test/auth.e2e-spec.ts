/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';
import { Role, RoleEnum } from '../src/modules/roles/schemas/role.schema';
import cookieParser from 'cookie-parser';
import { EmailService } from '../src/modules/email/email.service';
import { ThrottlerGuard } from '@nestjs/throttler';

jest.setTimeout(30000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: mongoose.Model<UserDocument>;
  let roleModel: mongoose.Model<Role>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.DATABASE_NAME = 'kredl_test';

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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();

    userModel = moduleFixture.get<mongoose.Model<UserDocument>>(
      getModelToken(User.name),
    );
    roleModel = moduleFixture.get<mongoose.Model<Role>>(
      getModelToken(Role.name),
    );

    // Seed roles
    await roleModel.create([
      { name: RoleEnum.STUDENT, description: 'Student' },
      { name: RoleEnum.ADMIN, description: 'Admin' },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    if (app) await app.close();
  });

  beforeAll(async () => {
    await userModel.deleteMany({});
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          role: RoleEnum.STUDENT,
        })
        .expect(201);

      expect(res.body.message).toBeDefined();

      const user = await userModel.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe('John');
      expect(user.passwordHash).toBeDefined();
    });
  });

  describe('/auth/login (POST)', () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
        role: RoleEnum.STUDENT,
      });

      // Need to activate user manually since verification is required
      await userModel.updateOne(
        { email: 'login@example.com' },
        { status: 'ACTIVE' },
      );
    });

    it('should login successfully and return access token & refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((c: string) => c.includes('refresh_token=')),
      ).toBeTruthy();
      expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBeTruthy();
    });

    it('should reject invalid credentials with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshTokenCookie: string;

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'refresh@example.com',
        password: 'Password123!',
        firstName: 'Refresh',
        lastName: 'User',
        role: RoleEnum.STUDENT,
      }).expect(201);

      await userModel.updateOne(
        { email: 'refresh@example.com' },
        { status: 'ACTIVE' },
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Password123!',
        }).expect(200);

      refreshTokenCookie = res.headers['set-cookie'].find((c: string) =>
        c.includes('refresh_token='),
      );
    });

    it('should rotate tokens and return a new access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      const cookies = res.headers['set-cookie'];
      expect(
        cookies.some((c: string) => c.includes('refresh_token=')),
      ).toBeTruthy();
    });

    it('should reject if refresh token is missing', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should reject if refresh token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=invalidtoken123')
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    let accessToken: string;
    
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'logout@example.com',
        password: 'Password123!',
        firstName: 'Logout',
        lastName: 'User',
        role: RoleEnum.STUDENT,
      }).expect(201);

      await userModel.updateOne(
        { email: 'logout@example.com' },
        { status: 'ACTIVE' },
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'Password123!',
        }).expect(200);

      accessToken = res.body.accessToken;
    });

    it('should clear refresh token cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body.message).toBeDefined();
      const cookies = res.headers['set-cookie'];
      expect(
        cookies.some((c: string) => c.includes('refresh_token=;')),
      ).toBeTruthy();
    });

    it('should reject if missing access token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
