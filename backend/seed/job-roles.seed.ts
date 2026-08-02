import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JobRole } from '../src/modules/job-roles/schemas/job-role.schema';
import { runSeeder } from './utils';

export async function seedJobRoles(app: INestApplicationContext) {
  await runSeeder('JobRoles', async () => {
    const jobRoleModel = app.get<Model<any>>(getModelToken(JobRole.name));

    const roles = [
      {
        title: 'Java Full Stack Developer',
        description: 'Design and develop full stack applications using Java, Spring Boot, and modern frontend frameworks like React or Angular.',
        requirements: ['Java 11+', 'Spring Boot', 'React/Angular', 'SQL/NoSQL databases', 'REST APIs', 'Git'],
      },
      {
        title: 'Backend Developer (Java)',
        description: 'Focus on building scalable, high-performance backend systems using Java and Spring framework.',
        requirements: ['Core Java', 'Spring Boot', 'Microservices', 'Database Design', 'Caching (Redis)'],
      },
      {
        title: 'Software Engineer',
        description: 'Generalist software engineer role involving design, development, and maintenance of software systems.',
        requirements: ['Data Structures & Algorithms', 'System Design', 'Strong problem solving skills', 'Programming in Java/C++/Python'],
      },
      {
        title: 'Associate Software Engineer',
        description: 'Entry-level position for fresh graduates to learn and contribute to software development projects.',
        requirements: ['Basic programming knowledge', 'Understanding of OOP concepts', 'SQL basics', 'Eagerness to learn'],
      },
      {
        title: 'Spring Boot Developer',
        description: 'Specialized role focusing on building enterprise applications using the Spring ecosystem.',
        requirements: ['Spring Boot', 'Spring Data JPA', 'Spring Security', 'RESTful web services'],
      },
      {
        title: 'REST API Developer',
        description: 'Design and implement robust RESTful APIs to connect various frontend systems and mobile apps.',
        requirements: ['API Design', 'HTTP Protocol', 'JSON', 'Spring Web', 'Postman'],
      },
      {
        title: 'Frontend Developer (React)',
        description: 'Build interactive user interfaces using React.js for modern web applications.',
        requirements: ['HTML/CSS', 'JavaScript/TypeScript', 'React.js', 'Redux', 'Responsive Design'],
      },
      {
        title: 'DevOps Engineer',
        description: 'Bridge the gap between development and operations by automating deployment pipelines.',
        requirements: ['Linux', 'Docker', 'Kubernetes', 'CI/CD (Jenkins/GitLab)', 'AWS/Azure'],
      },
      {
        title: 'Cloud Engineer',
        description: 'Design and manage cloud infrastructure for high availability and scalability.',
        requirements: ['AWS/GCP/Azure', 'Terraform', 'Networking', 'Cloud Security'],
      },
      {
        title: 'Database Administrator',
        description: 'Manage, optimize, and ensure the security of organizational databases.',
        requirements: ['MySQL/PostgreSQL', 'MongoDB', 'Performance Tuning', 'Backup & Recovery'],
      },
      {
        title: 'QA Engineer (Automation)',
        description: 'Ensure software quality by writing and executing automated test scripts.',
        requirements: ['Selenium', 'JUnit/TestNG', 'Java/Python', 'API Testing'],
      },
      {
        title: 'System Architect',
        description: 'Design complex software systems and make high-level architectural choices.',
        requirements: ['Microservices', 'System Design', 'Design Patterns', 'Scalability'],
      },
      {
        title: 'Data Engineer',
        description: 'Build and maintain data pipelines for analytics and machine learning.',
        requirements: ['SQL', 'Python', 'Spark', 'Hadoop', 'ETL Tools'],
      },
      {
        title: 'Security Engineer',
        description: 'Ensure the security of applications and infrastructure from cyber threats.',
        requirements: ['OWASP', 'Penetration Testing', 'Cryptography', 'Network Security'],
      },
      {
        title: 'Technical Lead',
        description: 'Lead a team of developers, provide technical guidance, and ensure project delivery.',
        requirements: ['Leadership', 'Agile/Scrum', 'Advanced System Design', 'Code Review'],
      }
    ];

    for (const roleData of roles) {
      const existing = await jobRoleModel.findOne({ title: roleData.title });
      if (!existing) {
        await jobRoleModel.create({
            ...roleData,
            isActive: true
        });
      }
    }
  });
}
