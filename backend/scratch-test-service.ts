import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CoursesService } from './src/modules/courses/courses.service';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  
  // Get admin user from DB
  const mongoose = require('mongoose');
  const user = await mongoose.connection.collection('users').findOne({ role: 'admin' });
  
  try {
    const res = await coursesService.getCourseModules('full-stack-java-developer-enterprise-architecture-modern-web', user._id.toString());
    console.log("Modules count:", res.modules.length);
    if (res.modules.length > 0) {
      console.log("Module 1 lessons:", res.modules[0].lessons);
    }
  } catch (e) {
    console.error(e);
  }
  await app.close();
}
test();
