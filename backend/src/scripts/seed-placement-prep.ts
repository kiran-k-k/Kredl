import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from '../modules/courses/schemas/course.schema';
import { CourseModule } from '../modules/modules/schemas/module.schema';
import { Lesson } from '../modules/lessons/schemas/lesson.schema';
import { Quiz } from '../modules/quiz/schemas/quiz.schema';
import { Company } from '../modules/companies/schemas/company.schema';
import { User } from '../modules/users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const courseModel = app.get<Model<Course>>(getModelToken(Course.name));
  const moduleModel = app.get<Model<CourseModule>>(getModelToken(CourseModule.name));
  const lessonModel = app.get<Model<Lesson>>(getModelToken(Lesson.name));
  const quizModel = app.get<Model<Quiz>>(getModelToken(Quiz.name));
  const companyModel = app.get<Model<Company>>(getModelToken(Company.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('Seeding Placement Preparation...');

  // Get Admin User
  const adminUser = await userModel.findOne({ role: 'admin' });
  const adminUserId = adminUser ? adminUser._id : new Types.ObjectId();

  // 1. Create or get target companies
  let tcs = await companyModel.findOne({ name: 'TCS' });
  if (!tcs) {
    tcs = await companyModel.create({
      name: 'TCS',
      slug: 'tcs',
      logo: 'https://logo.clearbit.com/tcs.com',
      website: 'tcs.com',
      overview: 'Tata Consultancy Services',
      hiringProcess: [],
      interviewRounds: [],
      preparationTips: [],
      faqs: [],
    });
  }

  let infosys = await companyModel.findOne({ name: 'Infosys' });
  if (!infosys) {
    infosys = await companyModel.create({
      name: 'Infosys',
      slug: 'infosys',
      logo: 'https://logo.clearbit.com/infosys.com',
      website: 'infosys.com',
      overview: 'Infosys Limited',
      hiringProcess: [],
      interviewRounds: [],
      preparationTips: [],
      faqs: [],
    });
  }

  // 2. Create Course
  let course = await courseModel.findOne({ slug: 'placement-preparation-masterclass' });
  if (course) {
    console.log('Course already exists. Exiting.');
    await app.close();
    return;
  }

  course = await courseModel.create({
    title: 'Placement Preparation Masterclass',
    slug: 'placement-preparation-masterclass',
    shortDescription: 'Complete preparation guide for campus placements',
    description: 'Master Aptitude, Logical Reasoning, HR Interviews, and Technical concepts required to crack top product and service-based companies.',
    category: 'Placement Preparation',
    difficulty: 'Intermediate',
    estimatedDuration: '8 weeks',
    createdBy: adminUserId,
    thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1000',
    tags: ['Placement', 'Interview', 'Aptitude'],
  });

  // 3. Create Modules
  const moduleNames = [
    'Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Communication Skills',
    'HR Interview',
    'Technical Interview',
    'Group Discussion',
    'Final Mock Tests'
  ];

  const modules = [];
  for (let i = 0; i < moduleNames.length; i++) {
    const slugName = moduleNames[i].toLowerCase().replace(/\s+/g, '-');
    const mod = await moduleModel.create({
      courseId: course._id as Types.ObjectId,
      title: moduleNames[i],
      slug: slugName,
      description: `Comprehensive module for ${moduleNames[i]}`,
      order: i + 1,
      createdBy: adminUserId,
    });
    modules.push(mod);
  }

  // 4. Create Lessons & Quizzes
  // For Aptitude
  await lessonModel.create({
    moduleId: modules[0]._id as Types.ObjectId,
    title: 'Quantitative Aptitude Basics',
    slug: 'quantitative-aptitude-basics',
    description: 'Learn the fundamentals of quantitative aptitude.',
    order: 1,
    durationMinutes: 45,
    learningObjectives: ['Understand Percentages', 'Learn Profit and Loss'],
    keyPoints: ['Use standard fractions for percentages'],
    createdBy: adminUserId,
  });

  await quizModel.create({
    moduleId: modules[0]._id as Types.ObjectId,
    title: 'Aptitude Practice Set 1',
    description: 'Test your quantitative aptitude skills.',
    type: 'PRACTICE',
    timeLimitMinutes: 30,
    passingScorePercentage: 70,
    totalMarks: 20,
    targetCompanies: [],
    questions: [
      {
        questionText: 'If the cost price of 12 items is equal to the selling price of 10 items, what is the profit percentage?',
        options: ['10%', '20%', '25%', '15%'],
        correctAnswerIndex: 1,
        explanation: 'CP of 12 = SP of 10 -> Profit = 2/10 = 20%',
        order: 1,
      }
    ],
    isActive: true,
    isPublished: true,
    createdBy: adminUserId,
  });

  // For Final Mock Tests
  await quizModel.create({
    moduleId: modules[7]._id as Types.ObjectId,
    title: 'TCS NQT National Mock Test',
    description: 'A full-length mock test replicating the TCS NQT pattern.',
    type: 'MOCK_TEST',
    timeLimitMinutes: 90,
    passingScorePercentage: 65,
    totalMarks: 100,
    targetCompanies: [tcs._id as Types.ObjectId],
    questions: [
      {
        questionText: 'Which of the following is a prime number?',
        options: ['21', '33', '47', '51'],
        correctAnswerIndex: 2,
        explanation: '47 has no divisors other than 1 and itself.',
        order: 1,
      }
    ],
    isActive: true,
    isPublished: true,
    createdBy: adminUserId,
  });

  console.log('Seeding completed successfully!');
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
