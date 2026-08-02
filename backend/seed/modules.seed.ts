import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from '../src/modules/courses/schemas/course.schema';
import { CourseModule } from '../src/modules/modules/schemas/module.schema';
import { runSeeder } from './utils';
import { COURSE_SLUG } from './courses.seed';

export const MODULE_DATA = [
  { title: 'Introduction', slug: 'java-introduction', order: 1, description: 'Introduction to Java and setting up the environment' },
  { title: 'Java Basics', slug: 'java-basics', order: 2, description: 'Variables, Data Types, Operators, and Control Flow' },
  { title: 'Object Oriented Programming', slug: 'java-oop', order: 3, description: 'Classes, Objects, Inheritance, Polymorphism, Abstraction, and Encapsulation' },
  { title: 'Collections Framework', slug: 'java-collections', order: 4, description: 'List, Set, Map, Queue, and algorithm operations' },
  { title: 'Exception Handling', slug: 'java-exceptions', order: 5, description: 'Try-catch blocks, custom exceptions, and error propagation' },
  { title: 'JDBC & Database Connectivity', slug: 'java-jdbc', order: 6, description: 'Connecting to databases, executing queries, and connection pooling' },
  { title: 'Maven & Gradle', slug: 'java-build-tools', order: 7, description: 'Build tools, dependency management, and plugins' },
  { title: 'Spring Core', slug: 'spring-core', order: 8, description: 'Dependency Injection, IoC Container, and Spring Beans' },
  { title: 'Spring Boot', slug: 'spring-boot', order: 9, description: 'Auto-configuration, Starters, and building production-ready apps' },
  { title: 'REST APIs', slug: 'spring-rest-apis', order: 10, description: 'Designing, building, and documenting RESTful endpoints' },
  { title: 'Hibernate & JPA', slug: 'hibernate-jpa', order: 11, description: 'ORM, Entity mapping, associations, and Spring Data JPA' },
  { title: 'Final Projects & Deployment', slug: 'java-final-projects', order: 12, description: 'Building full applications and deploying them to AWS/Heroku' }
];

export async function seedModules(app: INestApplicationContext) {
  await runSeeder('Modules', async () => {
    const courseModel = app.get<Model<any>>(getModelToken(Course.name));
    const moduleModel = app.get<Model<any>>(getModelToken(CourseModule.name));

    const course = await courseModel.findOne({ slug: COURSE_SLUG });
    if (!course) {
      throw new Error(`Course with slug ${COURSE_SLUG} not found. Run courses seed first.`);
    }

    for (const mod of MODULE_DATA) {
      const existing = await moduleModel.findOne({ courseId: course._id, slug: mod.slug });
      if (!existing) {
        await moduleModel.create({
          courseId: course._id,
          ...mod,
          isPublished: true
        });
      }
    }
  });
}
