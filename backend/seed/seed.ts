import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { seedLogger } from './utils';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';
import { seedCompanies } from './companies.seed';
import { seedJobRoles } from './job-roles.seed';
import { seedJobs } from './jobs.seed';
import { seedCourses } from './courses.seed';
import { seedModules } from './modules.seed';
import { seedLessons } from './lessons.seed';
import { seedNotes } from './notes.seed';
import { seedQuizzes } from './quizzes.seed';
import { seedProjects } from './projects.seed';
import { seedImportedCourse } from './import-course.seed';

async function bootstrap() {
  seedLogger.log('Initializing Kredl Seed Pipeline...');
  
  // Create a headless application context
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    seedLogger.log('====================================');
    seedLogger.log('STARTING SEED PROCESS');
    seedLogger.log('====================================');

    // 1. Roles and Users
    await seedRoles(app);
    await seedUsers(app);

    // 2. Career (Companies, Roles, Jobs)
    await seedCompanies(app);
    await seedJobRoles(app);
    await seedJobs(app);

    // 3. Educational Content (Course, Modules, Lessons, Notes, Quizzes, Projects)
    await seedCourses(app);
    await seedModules(app);
    await seedLessons(app);
    await seedNotes(app);
    await seedQuizzes(app);
    await seedProjects(app);
    
    // 4. Data Pipeline (Imported Full-Stack Java)
    await seedImportedCourse(app);

    seedLogger.log('====================================');
    seedLogger.log('SEED COMPLETED SUCCESSFULLY');
    seedLogger.log('====================================');
  } catch (error) {
    seedLogger.error('SEED FAILED', error);
  } finally {
    await app.close();
  }
}

bootstrap();
