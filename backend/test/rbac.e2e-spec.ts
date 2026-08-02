import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserStatus } from '../src/modules/users/schemas/user.schema';
import { Role, RoleEnum } from '../src/modules/roles/schemas/role.schema';
import cookieParser from 'cookie-parser';
import { EmailService } from '../src/modules/email/email.service';
import { ThrottlerGuard } from '@nestjs/throttler';

jest.setTimeout(30000);

describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let userModel: mongoose.Model<UserDocument>;
  let roleModel: mongoose.Model<Role>;
  let studentToken: string;
  let adminToken: string;
  let tpoToken: string;

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    await app.init();

    userModel = moduleFixture.get<mongoose.Model<UserDocument>>(
      getModelToken(User.name),
    );
    roleModel = moduleFixture.get<mongoose.Model<Role>>(getModelToken(Role.name));
    
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (app) await app.close();
  });

  describe('Setup Roles and Users', () => {
    it('should setup Admin, TPO and Student users', async () => {
      const adminRole = await roleModel.findOne({ name: RoleEnum.ADMIN });
      const tpoRole = await roleModel.findOne({ name: RoleEnum.TPO });
      const studentRole = await roleModel.findOne({ name: RoleEnum.STUDENT });

      // Create Admin
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'admin@example.com',
        password: 'Password123!',
        firstName: 'Admin',
        lastName: 'User',
      });
      await userModel.updateOne(
        { email: 'admin@example.com' },
        { roleId: adminRole._id, isEmailVerified: true, status: UserStatus.ACTIVE }
      );
      const resAdmin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
      adminToken = resAdmin.body.accessToken;

      // Create TPO
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'tpo@example.com',
        password: 'Password123!',
        firstName: 'TPO',
        lastName: 'User',
      });
      await userModel.updateOne(
        { email: 'tpo@example.com' },
        { roleId: tpoRole._id, isEmailVerified: true, status: UserStatus.ACTIVE }
      );
      const resTpo = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'tpo@example.com',
        password: 'Password123!',
      });
      tpoToken = resTpo.body.accessToken;

      // Create Student
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'student@example.com',
        password: 'Password123!',
        firstName: 'Student',
        lastName: 'User',
      });
      await userModel.updateOne(
        { email: 'student@example.com' },
        { roleId: studentRole._id, isEmailVerified: true, status: UserStatus.ACTIVE }
      );
      const resStudent = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'student@example.com',
        password: 'Password123!',
      });
      studentToken = resStudent.body.accessToken;

      expect(adminToken).toBeDefined();
      expect(tpoToken).toBeDefined();
      expect(studentToken).toBeDefined();
    });
  });

  describe('Admin Routes', () => {
    it('Admin can access admin users route', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(res => {
            // we accept 200 (Success) or 404 (Not Found if users route expects ID etc, but shouldn't be 403)
            if (res.status === 403 || res.status === 401) {
                console.log(res.body);
            }
        })
        .expect(200);
    });

    it('Student cannot access admin users route', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('TPO cannot access admin users route', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${tpoToken}`)
        .expect(403);
    });
  });

  describe('TPO Routes', () => {
    // Placement Drives POST is typically TPO/Admin
    let createDriveData = {
      title: 'TPO Drive',
      companyId: new mongoose.Types.ObjectId().toString(),
      description: 'Desc',
      status: 'upcoming'
    };

    it('TPO can access placement drives route', async () => {
      await request(app.getHttpServer())
        .post('/placement-drives')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send(createDriveData)
        // 400 means validation failed (e.g. invalid companyId or dates missing) but not 403!
        // So we expect anything but 403/401. Let's just expect 400 since we have missing fields.
        .expect(res => {
             if (res.status === 401 || res.status === 403) {
                 throw new Error(`Expected access but got ${res.status}`);
             }
        });
    });

    it('Admin can access placement drives route', async () => {
      await request(app.getHttpServer())
        .post('/placement-drives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDriveData)
        .expect(res => {
             if (res.status === 401 || res.status === 403) {
                 throw new Error(`Expected access but got ${res.status}`);
             }
        });
    });

    it('Student cannot create placement drives', async () => {
      await request(app.getHttpServer())
        .post('/placement-drives')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createDriveData)
        .expect(403);
    });
  });
});
