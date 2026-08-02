import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from '../src/modules/courses/schemas/course.schema';
import { Project } from '../src/modules/projects/schemas/project.schema';
import { runSeeder } from './utils';
import { COURSE_SLUG } from './courses.seed';

export async function seedProjects(app: INestApplicationContext) {
  await runSeeder('Projects', async () => {
    const courseModel = app.get<Model<any>>(getModelToken(Course.name));
    const projectModel = app.get<Model<any>>(getModelToken(Project.name));

    const course = await courseModel.findOne({ slug: COURSE_SLUG });
    if (!course) {
      throw new Error(`Course with slug ${COURSE_SLUG} not found. Run courses seed first.`);
    }

    const projects = [
      {
        title: 'Library Management System',
        description: 'A monolithic Spring Boot application to manage books, patrons, and borrowing records using Hibernate and MySQL.',
        difficulty: 'Beginner',
        requirements: ['Core Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'Thymeleaf'],
        expectedOutput: 'A fully functional web app where admins can add books, and users can borrow/return books with fine calculation.',
        skillsLearned: ['CRUD Operations', 'Entity Relationships', 'MVC Architecture'],
        githubUrl: 'https://github.com/spring-projects/spring-petclinic',
        isPublished: true,
      },
      {
        title: 'Student Management System REST API',
        description: 'Build a secure RESTful API for managing student records, grades, and course enrollments.',
        difficulty: 'Intermediate',
        requirements: ['Spring Web', 'Spring Security', 'JWT', 'PostgreSQL'],
        expectedOutput: 'A set of secured API endpoints tested via Postman, with Role-Based Access Control (Admin vs Student).',
        skillsLearned: ['RESTful Design', 'JWT Authentication', 'Spring Security'],
        githubUrl: 'https://github.com/spring-guides/gs-rest-service',
        isPublished: true,
      },
      {
        title: 'E-Commerce Backend Microservices',
        description: 'Design a scalable e-commerce backend using microservices architecture (User, Catalog, Order, Payment).',
        difficulty: 'Advanced',
        requirements: ['Spring Cloud', 'Eureka', 'API Gateway', 'RabbitMQ', 'Docker'],
        expectedOutput: 'A distributed system where services communicate asynchronously and are deployed via Docker Compose.',
        skillsLearned: ['Microservices', 'Message Queues', 'Containerization'],
        githubUrl: 'https://github.com/microservices-demo/microservices-demo',
        isPublished: true,
      },
      {
        title: 'Task Management API',
        description: 'A Kanban-style task management API with real-time notifications via WebSockets.',
        difficulty: 'Intermediate',
        requirements: ['Spring Boot WebSockets', 'MongoDB', 'Redis Caching'],
        expectedOutput: 'An API capable of handling concurrent task updates and broadcasting changes to connected clients.',
        skillsLearned: ['WebSockets', 'NoSQL', 'Caching strategies'],
        githubUrl: 'https://github.com/spring-guides/gs-messaging-stomp-websocket',
        isPublished: true,
      },
      {
        title: 'Hospital Management System',
        description: 'Comprehensive system for scheduling appointments, managing patient records, and billing.',
        difficulty: 'Advanced',
        requirements: ['Java 17', 'Spring Boot 3', 'Angular/React integration', 'PostgreSQL'],
        expectedOutput: 'A full-stack application with a Java backend and a frontend SPA.',
        skillsLearned: ['Full Stack Integration', 'Complex SQL Queries', 'Reporting'],
        githubUrl: 'https://github.com/spring-projects/spring-petclinic',
        isPublished: true,
      },
      {
        title: 'Employee Leave Management',
        description: 'An internal HR tool for employees to apply for leaves and managers to approve/reject them.',
        difficulty: 'Beginner',
        requirements: ['Spring Boot', 'H2 Database', 'Spring Mail'],
        expectedOutput: 'A simple app that triggers email notifications upon leave status changes.',
        skillsLearned: ['Email Integration', 'State Machines', 'Scheduling'],
        githubUrl: 'https://github.com/spring-guides/gs-scheduling-tasks',
        isPublished: true,
      },
      {
        title: 'Banking Transaction Engine',
        description: 'A high-throughput transaction processing engine that guarantees ACID properties.',
        difficulty: 'Advanced',
        requirements: ['Spring Batch', 'Pessimistic Locking', 'Transactional Outbox Pattern'],
        expectedOutput: 'A robust engine handling thousands of simulated concurrent transactions without race conditions.',
        skillsLearned: ['Concurrency', 'Database Locks', 'Spring Batch'],
        githubUrl: 'https://github.com/spring-projects/spring-batch',
        isPublished: true,
      },
      {
        title: 'Movie Ticket Booking System',
        description: 'A system to browse movies, select seats, and handle concurrent booking conflicts.',
        difficulty: 'Intermediate',
        requirements: ['Spring Boot', 'Redis (Distributed Locks)', 'Stripe API'],
        expectedOutput: 'Integration with a 3rd party payment gateway and proper seat lock handling.',
        skillsLearned: ['Payment Gateway Integration', 'Distributed Caching', 'API Design'],
        githubUrl: 'https://github.com/spring-guides/gs-rest-service',
        isPublished: true,
      }
    ];

    for (const projectData of projects) {
      const existing = await projectModel.findOne({ courseId: course._id, title: projectData.title });
      if (!existing) {
        await projectModel.create({
          courseId: course._id,
          ...projectData
        });
      }
    }
  });
}
