import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Lesson } from '../modules/lessons/schemas/lesson.schema';
import { CourseModule } from '../modules/modules/schemas/module.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const lessonModel = app.get<Model<Lesson>>(getModelToken(Lesson.name));
  const moduleModel = app.get<Model<CourseModule>>(getModelToken(CourseModule.name));

  const lessons = await lessonModel.find({ isDeleted: { $ne: true } });
  console.log('Total Lessons:', lessons.length);

  for (const lesson of lessons) {
    const mod = await moduleModel.findById(lesson.moduleId);
    if (!mod) {
      console.log('Lesson', lesson.title, 'has no module');
    } else if (mod.isDeleted) {
      console.log('Lesson', lesson.title, 'belongs to DELETED module:', mod.title);
    }
  }
  
  await app.close();
}
bootstrap();
