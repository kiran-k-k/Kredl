import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from '../src/modules/courses/schemas/course.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { runSeeder } from './utils';

export const COURSE_SLUG = 'java-full-stack-developer';

export async function seedCourses(app: INestApplicationContext) {
  await runSeeder('Courses', async () => {
    const courseModel = app.get<Model<any>>(getModelToken(Course.name));
    const userModel = app.get<Model<any>>(getModelToken(User.name));

    const admin = await userModel.findOne({ email: 'admin@kredl.dev' });
    if (!admin) {
      throw new Error('Admin user not found. Run users seed first.');
    }

    const courseData = {
      title: 'Java Full Stack Developer',
      slug: COURSE_SLUG,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Software Development',
      difficulty: 'Intermediate',
      shortDescription: 'Master full stack development with Java, Spring Boot, and React. Build production-ready enterprise applications from scratch.',
      description: 'This comprehensive premium course is designed to take you from a Java beginner to a highly proficient Full Stack Developer. You will learn Core Java, Object-Oriented Programming, Data Structures, Spring Boot, REST APIs, Hibernate, and modern frontend development. The curriculum is perfectly tailored to meet industry standards, giving you the hands-on experience necessary to crack interviews at top tech companies.',
      prerequisites: ['Basic understanding of programming concepts', 'Familiarity with HTML/CSS', 'No prior Java experience required'],
      learningOutcomes: [
        'Build scalable backend REST APIs using Spring Boot',
        'Design and implement secure database schemas with MySQL and Hibernate',
        'Develop interactive user interfaces using modern frontend frameworks',
        'Deploy Java applications to cloud platforms',
        'Implement authentication and authorization using JWT and Spring Security'
      ],
      estimatedDuration: 120, // 120 hours
      tags: ['Java', 'Spring Boot', 'Full Stack', 'Backend', 'React', 'Enterprise'],
      displayOrder: 1,
      isPublished: true,
      price: 0,
      createdBy: admin._id,
    };

    const existing = await courseModel.findOne({ slug: courseData.slug });
    if (!existing) {
      await courseModel.create(courseData);
    } else {
      await courseModel.updateOne({ _id: existing._id }, { $set: courseData });
    }
  });
}
