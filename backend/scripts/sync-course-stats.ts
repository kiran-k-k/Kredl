import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDocument, Course } from '../src/modules/courses/schemas/course.schema';
import { CourseModuleDocument, CourseModule as CourseModuleModel } from '../src/modules/modules/schemas/module.schema';
import { LessonDocument, Lesson } from '../src/modules/lessons/schemas/lesson.schema';
import { ProjectDocument, Project } from '../src/modules/projects/schemas/project.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const courseModel = app.get<Model<CourseDocument>>(getModelToken(Course.name));
  const moduleModel = app.get<Model<CourseModuleDocument>>(getModelToken(CourseModuleModel.name));
  const lessonModel = app.get<Model<LessonDocument>>(getModelToken(Lesson.name));
  const projectModel = app.get<Model<ProjectDocument>>(getModelToken(Project.name));

  console.log('Starting course stats sync...');

  const courses = await courseModel.find({ isDeleted: { $ne: true } });

  for (const course of courses) {
    console.log(`Processing course: ${course.title} (${course._id})`);

    // Get modules
    const modules = await moduleModel.find({ courseId: course._id, isDeleted: { $ne: true } });
    const moduleCount = modules.length;
    
    let lessonCount = 0;
    let totalDurationMinutes = 0;

    for (const mod of modules) {
      // Get lessons
      const lessons = await lessonModel.find({ moduleId: mod._id, isDeleted: { $ne: true } });
      lessonCount += lessons.length;
      
      for (const lesson of lessons) {
        totalDurationMinutes += lesson.durationMinutes || 0;
      }
    }

    // Format estimated duration
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    
    let durationStr = '';
    if (hours > 0) {
      durationStr += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0 || hours === 0) {
      durationStr += `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    
    // Update course
    course.moduleCount = moduleCount;
    course.lessonCount = lessonCount;
    course.estimatedDuration = durationStr.trim();
    
    await course.save();
    console.log(`  Updated: ${moduleCount} modules, ${lessonCount} lessons, ${durationStr.trim()}`);
  }

  console.log('Sync complete!');
  await app.close();
  process.exit(0);
}

bootstrap();
