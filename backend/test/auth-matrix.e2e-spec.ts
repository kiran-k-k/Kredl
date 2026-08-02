/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get, UseGuards } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { Roles } from '../src/modules/auth/decorators/roles.decorator';
import { RoleEnum } from '../src/modules/roles/schemas/role.schema';
import { AuthService } from '../src/modules/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/modules/users/schemas/user.schema';
import { Model } from 'mongoose';
import { Role } from '../src/modules/roles/schemas/role.schema';

@Controller('test-matrix')
@UseGuards(JwtAuthGuard, RolesGuard)
class TestMatrixController {
  @Get('public')
  @UseGuards(RolesGuard) // Just to see if public without JwtAuthGuard is allowed, wait, we need public decorator? I will test protected endpoints.
  getPublic() {
    return 'public';
  }

  @Get('student')
  @Roles(RoleEnum.STUDENT)
  getStudent() {
    return 'student';
  }

  @Get('admin')
  @Roles(RoleEnum.ADMIN)
  getAdmin() {
    return 'admin';
  }

  @Get('tpo')
  @Roles(RoleEnum.TPO)
  getTpo() {
    return 'tpo';
  }

  @Get('student-admin')
  @Roles(RoleEnum.STUDENT, RoleEnum.ADMIN)
  getStudentAdmin() {
    return 'student-admin';
  }
}

jest.setTimeout(30000);

describe('Authorization Matrix (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userModel: Model<User>;
  let roleModel: Model<Role>;
  const tokens: Record<string, string> = {};
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.DATABASE_NAME = 'kredl_matrix_test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestMatrixController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    roleModel = moduleFixture.get<Model<Role>>(getModelToken(Role.name));

    // Clear db
    await userModel.deleteMany({});
    await roleModel.deleteMany({});

    // Create roles
    const studentRole = await roleModel.create({
      name: RoleEnum.STUDENT,
      permissions: [],
    });
    const adminRole = await roleModel.create({
      name: RoleEnum.ADMIN,
      permissions: [],
    });
    const tpoRole = await roleModel.create({
      name: RoleEnum.TPO,
      permissions: [],
    });

    // Helper to create users and login
    const createUser = async (email: string, roleId: any) => {
      const user = await userModel.create({
        email,
        passwordHash: 'hash',
        roleId,
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIVE',
      });
      const jwt = (await authService.login(user)).accessToken;
      return jwt;
    };

    tokens.student = await createUser('student@test.com', studentRole._id);
    tokens.admin = await createUser('admin@test.com', adminRole._id);
    tokens.tpo = await createUser('tpo@test.com', tpoRole._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    if (app) await app.close();
  });

  describe('Unauthenticated Guest', () => {
    it('should be rejected from Student route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student')
        .expect(401);
    });
    it('should be rejected from Admin route', () => {
      return request(app.getHttpServer()).get('/test-matrix/admin').expect(401);
    });
    it('should be rejected from TPO route', () => {
      return request(app.getHttpServer()).get('/test-matrix/tpo').expect(401);
    });
  });

  describe('Student User', () => {
    it('should access Student route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);
    });
    it('should be rejected from Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/admin')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(403);
    });
    it('should be rejected from TPO route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/tpo')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(403);
    });
    it('should access Student-Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student-admin')
        .set('Authorization', `Bearer ${tokens.student}`)
        .expect(200);
    });
  });

  describe('Admin User', () => {
    it('should be rejected from Student route (strict RBAC)', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403);
    });
    it('should access Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/admin')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);
    });
    it('should be rejected from TPO route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/tpo')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403);
    });
    it('should access Student-Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student-admin')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(200);
    });
  });

  describe('TPO User', () => {
    it('should be rejected from Student route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student')
        .set('Authorization', `Bearer ${tokens.tpo}`)
        .expect(403);
    });
    it('should be rejected from Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/admin')
        .set('Authorization', `Bearer ${tokens.tpo}`)
        .expect(403);
    });
    it('should access TPO route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/tpo')
        .set('Authorization', `Bearer ${tokens.tpo}`)
        .expect(200);
    });
    it('should be rejected from Student-Admin route', () => {
      return request(app.getHttpServer())
        .get('/test-matrix/student-admin')
        .set('Authorization', `Bearer ${tokens.tpo}`)
        .expect(403);
    });
  });
});
