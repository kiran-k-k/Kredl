import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model, Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/modules/users/schemas/user.schema';
import { Role, RoleEnum } from '../src/modules/roles/schemas/role.schema';
import { Course } from '../src/modules/courses/schemas/course.schema';
import { CourseModule } from '../src/modules/modules/schemas/module.schema';
import { Lesson } from '../src/modules/lessons/schemas/lesson.schema';
import { Quiz } from '../src/modules/quiz/schemas/quiz.schema';
import { QuizAttempt } from '../src/modules/quiz/schemas/quiz-attempt.schema';
import { Progress } from '../src/modules/progress/schemas/progress.schema';
import { AuthService } from '../src/modules/auth/auth.service';

jest.setTimeout(45000);

describe('Quiz & Analytics Progression Flow (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let authService: AuthService;

  // Models
  let userModel: Model<User>;
  let roleModel: Model<Role>;
  let courseModel: Model<Course>;
  let moduleModel: Model<CourseModule>;
  let lessonModel: Model<Lesson>;
  let quizModel: Model<Quiz>;
  let quizAttemptModel: Model<QuizAttempt>;
  let progressModel: Model<Progress>;

  // Variables
  let studentToken: string;
  let studentUserId: string;
  let adminToken: string;

  let courseId: string;
  let module1Id: string;
  let module2Id: string;
  let lesson1Id: string;
  let quizId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.DATABASE_NAME = 'quiz_analytics_e2e';
    process.env.JWT_SECRET = 'e2e-secret-key';
    process.env.JWT_REFRESH_SECRET = 'e2e-refresh-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    roleModel = moduleFixture.get<Model<Role>>(getModelToken(Role.name));
    courseModel = moduleFixture.get<Model<Course>>(getModelToken(Course.name));
    moduleModel = moduleFixture.get<Model<CourseModule>>(
      getModelToken(CourseModule.name),
    );
    lessonModel = moduleFixture.get<Model<Lesson>>(getModelToken(Lesson.name));
    quizModel = moduleFixture.get<Model<Quiz>>(getModelToken(Quiz.name));
    quizAttemptModel = moduleFixture.get<Model<QuizAttempt>>(
      getModelToken(QuizAttempt.name),
    );
    progressModel = moduleFixture.get<Model<Progress>>(
      getModelToken(Progress.name),
    );

    // Clear Collections
    await userModel.deleteMany({});
    await roleModel.deleteMany({});
    await courseModel.deleteMany({});
    await moduleModel.deleteMany({});
    await lessonModel.deleteMany({});
    await quizModel.deleteMany({});
    await quizAttemptModel.deleteMany({});
    await progressModel.deleteMany({});

    // Create Roles
    const studentRole = await roleModel.create({ name: RoleEnum.STUDENT });
    const adminRole = await roleModel.create({ name: RoleEnum.ADMIN });

    // Create Student & Admin Users
    const studentUser = await userModel.create({
      email: 'student@test.com',
      passwordHash: 'hash',
      roleId: studentRole._id,
      firstName: 'Kiran',
      lastName: 'Kendre',
      status: 'ACTIVE',
    });
    studentUserId = studentUser._id.toString();
    studentToken = (await authService.login(studentUser)).accessToken;

    const adminUser = await userModel.create({
      email: 'admin@test.com',
      passwordHash: 'hash',
      roleId: adminRole._id,
      firstName: 'System',
      lastName: 'Admin',
      status: 'ACTIVE',
    });
    adminToken = (await authService.login(adminUser)).accessToken;

    // Create Course
    const course = await courseModel.create({
      title: 'Full Stack Roadmap',
      slug: 'full-stack-roadmap',
      description:
        'Full Course description that is long enough to satisfy constraints',
      shortDescription: 'Short roadmap description.',
      category: 'Software Development',
      difficulty: 'Beginner',
      thumbnail: 'https://res.cloudinary.com/dummy-img',
      estimatedDuration: '10 hours',
      createdBy: adminUser._id,
      status: 'published',
    });
    courseId = course._id.toString();

    // Create Module 1
    const mod1 = await moduleModel.create({
      courseId: course._id,
      title: 'HTML Basics',
      slug: 'html-basics',
      status: 'published',
      order: 1,
      isDeleted: false,
    });
    module1Id = mod1._id.toString();

    // Create Module 2
    const mod2 = await moduleModel.create({
      courseId: course._id,
      title: 'CSS Layouts',
      slug: 'css-layouts',
      status: 'published',
      order: 2,
      isDeleted: false,
    });
    module2Id = mod2._id.toString();

    // Create Lesson inside Module 1
    const lesson = await lessonModel.create({
      courseId: course._id,
      moduleId: mod1._id,
      title: 'Tags and Elements',
      slug: 'tags-and-elements',
      status: 'published',
      order: 1,
      isDeleted: false,
    });
    lesson1Id = lesson._id.toString();

    // Create Quiz for Module 1 (passingScore: 70%, 10 marks total)
    const quiz = await quizModel.create({
      moduleId: mod1._id,
      title: 'HTML Basics Quiz',
      passingScorePercentage: 70,
      timeLimitMinutes: 15,
      totalMarks: 10,
      maxAttempts: 3,
      cooldownMinutes: 0,
      questions: [
        {
          _id: new Types.ObjectId(),
          questionText: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Text Machine Language',
            'Hyper Tabular Main Link',
          ],
          correctAnswerIndex: 0,
          explanation: 'HTML stands for Hyper Text Markup Language.',
          order: 1,
        },
        {
          _id: new Types.ObjectId(),
          questionText: 'Which tag is used for the largest heading?',
          options: ['<h6>', '<heading>', '<h1>'],
          correctAnswerIndex: 2,
          explanation: '<h1> represents the largest heading element.',
          order: 2,
        },
      ],
      isPublished: true,
      isDeleted: false,
    });
    quizId = quiz._id.toString();

    // Enroll student in the course
    await progressModel.create({
      userId: studentUser._id,
      courseId: course._id,
      completedLessons: [],
      percentage: 0,
      status: 'in_progress',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  describe('Active Quiz & Progression Safeguards', () => {
    it('rejects quiz start if lessons are incomplete', async () => {
      const res = await request(app.getHttpServer())
        .post('/quiz/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ moduleId: module1Id });

      expect(res.status).toBe(403); // Lessons must be completed first
    });

    it('denies access to locked modules or quizzes', async () => {
      // Module 2 is locked because Module 1 quiz is not passed
      const res = await request(app.getHttpServer())
        .get(`/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      const mod2Access = res.body.modules.find((m: any) => m.id === module2Id);
      expect(mod2Access.locked).toBe(true);
    });

    it('hides correct answers and explanations during quiz fetch', async () => {
      // Simulate lesson completion
      const progress = await progressModel.findOne({
        userId: new Types.ObjectId(studentUserId),
      });
      progress.completedLessons.push(new Types.ObjectId(lesson1Id));
      await progress.save();

      const res = await request(app.getHttpServer())
        .get(`/quiz/${module1Id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.questions[0].correctAnswerIndex).toBeUndefined();
      expect(res.body.questions[0].explanation).toBeUndefined();
    });
  });

  describe('Quiz Attempt & Unlocking Flow', () => {
    let attemptId: string;

    it('allows starting a quiz attempt once lessons are complete', async () => {
      const res = await request(app.getHttpServer())
        .post('/quiz/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ moduleId: module1Id });

      expect(res.status).toBe(200);
      expect(res.body.attemptId).toBeDefined();
      attemptId = res.body.attemptId;
    });

    it('re-evaluates module lock when quiz is failed', async () => {
      // Submit failing answers (Q1: index 1 - wrong, Q2: index 0 - wrong -> 0/2 score = 0%)
      const quiz = await quizModel.findById(quizId);
      const q1Id = quiz.questions[0]._id.toString();
      const q2Id = quiz.questions[1]._id.toString();

      const res = await request(app.getHttpServer())
        .post('/quiz/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          answers: [
            { questionId: q1Id, selectedAnswerIndex: 1 },
            { questionId: q2Id, selectedAnswerIndex: 0 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.passed).toBe(false);

      // Wait for asynchronous event listener to run
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify module 2 remains locked
      const modulesRes = await request(app.getHttpServer())
        .get(`/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${studentToken}`);

      const mod2Access = modulesRes.body.modules.find(
        (m: any) => m.id === module2Id,
      );
      expect(mod2Access.locked).toBe(true);
    });

    it('unlocks next module when quiz is passed', async () => {
      // Start attempt 2
      const startRes = await request(app.getHttpServer())
        .post('/quiz/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ moduleId: module1Id });
      const newAttemptId = startRes.body.attemptId;

      // Submit passing answers (Q1: index 0 - correct, Q2: index 2 - correct -> 2/2 score = 100%)
      const quiz = await quizModel.findById(quizId);
      const q1Id = quiz.questions[0]._id.toString();
      const q2Id = quiz.questions[1]._id.toString();

      const submitRes = await request(app.getHttpServer())
        .post('/quiz/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: newAttemptId,
          answers: [
            { questionId: q1Id, selectedAnswerIndex: 0 },
            { questionId: q2Id, selectedAnswerIndex: 2 },
          ],
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.passed).toBe(true);

      // Wait for asynchronous event listener to run
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify Module 2 is now unlocked
      const modulesRes = await request(app.getHttpServer())
        .get(`/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${studentToken}`);

      const mod2Access = modulesRes.body.modules.find(
        (m: any) => m.id === module2Id,
      );
      expect(mod2Access.locked).toBe(false);
      expect(mod2Access.available).toBe(true);
    });
  });

  describe('Admin Analytics & Role-Based Access Control', () => {
    it('restricts /admin/analytics/quizzes from students', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/analytics/quizzes')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403); // Forbidden
    });

    it('allows admins to fetch aggregate quiz statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/analytics/quizzes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const quizStats = res.body.data.find((q: any) => q.quizId === quizId);
      expect(quizStats).toBeDefined();
      expect(quizStats.totalAttempts).toBe(2);
      expect(quizStats.passCount).toBe(1);
      expect(quizStats.failCount).toBe(1);
      expect(quizStats.passRate).toBe(50);
    });

    it('allows admins to fetch most missed questions', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/analytics/questions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      // Both questions should be listed since at least one student missed them
      const q1Stats = res.body.data[0];
      expect(q1Stats.questionText).toBeDefined();
      expect(q1Stats.incorrectCount).toBe(1);
    });
  });
});
