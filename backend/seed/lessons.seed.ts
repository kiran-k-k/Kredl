import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CourseModule } from '../src/modules/modules/schemas/module.schema';
import { Lesson } from '../src/modules/lessons/schemas/lesson.schema';
import { runSeeder } from './utils';

const YOUTUBE_URLS = [
  'https://www.youtube.com/watch?v=grEKMHGYfns', // Java in 100 Seconds
  'https://www.youtube.com/watch?v=eIrMbAQSU34', // Java Tutorial for Beginners
  'https://www.youtube.com/watch?v=bCj2qF0KxM0', // Spring Boot Tutorial
  'https://www.youtube.com/watch?v=346Gs5N2i88', // OOP Concepts
  'https://www.youtube.com/watch?v=viZWJ1-2W2g', // Collections
];

const YOUTUBE_THUMBNAILS = [
  'https://img.youtube.com/vi/grEKMHGYfns/hqdefault.jpg',
  'https://img.youtube.com/vi/eIrMbAQSU34/hqdefault.jpg',
  'https://img.youtube.com/vi/bCj2qF0KxM0/hqdefault.jpg',
  'https://img.youtube.com/vi/346Gs5N2i88/hqdefault.jpg',
  'https://img.youtube.com/vi/viZWJ1-2W2g/hqdefault.jpg',
];

export async function seedLessons(app: INestApplicationContext) {
  await runSeeder('Lessons', async () => {
    const moduleModel = app.get<Model<any>>(getModelToken(CourseModule.name));
    const lessonModel = app.get<Model<any>>(getModelToken(Lesson.name));

    const modules = await moduleModel.find().sort({ order: 1 });
    
    if (modules.length === 0) {
      throw new Error('Modules not found. Run modules seed first.');
    }

    for (const mod of modules) {
      const lessonCount = await lessonModel.countDocuments({ moduleId: mod._id });
      if (lessonCount > 0) continue; // Skip if lessons already exist for this module

      const numLessons = 3 + (mod.order % 3); // 3 to 5 lessons
      
      for (let i = 1; i <= numLessons; i++) {
        const index = (mod.order + i) % YOUTUBE_URLS.length;
        await lessonModel.create({
          moduleId: mod._id,
          title: `${mod.title} - Part ${i}`,
          slug: `${mod.slug}-part-${i}`,
          description: `Detailed walkthrough of ${mod.title} concepts. In this lesson, we cover part ${i} of our comprehensive module.`,
          order: i,
          duration: 15 + (i * 10), // 25, 35, 45 mins
          videoUrl: YOUTUBE_URLS[index],
          videoThumbnail: YOUTUBE_THUMBNAILS[index],
          estimatedWatchTime: 15 + (i * 10),
          isPublished: true
        });
      }
    }
  });
}
