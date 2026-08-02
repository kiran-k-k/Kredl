import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Job } from '../src/modules/jobs/schemas/job.schema';
import { Company } from '../src/modules/companies/schemas/company.schema';
import { JobRole } from '../src/modules/job-roles/schemas/job-role.schema';
import { runSeeder } from './utils';

export async function seedJobs(app: INestApplicationContext) {
  await runSeeder('Jobs', async () => {
    const jobModel = app.get<Model<any>>(getModelToken(Job.name));
    const companyModel = app.get<Model<any>>(getModelToken(Company.name));
    const jobRoleModel = app.get<Model<any>>(getModelToken(JobRole.name));

    const companies = await companyModel.find();
    const roles = await jobRoleModel.find();

    if (companies.length === 0 || roles.length === 0) {
      throw new Error('Companies or JobRoles missing. Seed them first.');
    }

    const jobTypes = ['Internship', 'Full-time', 'Part-time'];
    const locations = ['Bangalore', 'Hyderabad', 'Pune', 'Remote', 'Mumbai', 'Chennai'];
    
    // Check if we already have enough jobs seeded
    const existingCount = await jobModel.countDocuments();
    if (existingCount >= 30) {
      return; // Already seeded
    }

    const jobsToCreate = [];
    
    // Deterministic random selection for 30 jobs
    for (let i = 0; i < 30; i++) {
      const company = companies[i % companies.length];
      const role = roles[(i * 3) % roles.length];
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 15 + (i % 30)); // 15-45 days in future

      jobsToCreate.push({
        companyId: company._id,
        roleId: role._id,
        title: role.title,
        location: locations[i % locations.length],
        jobType: jobTypes[i % jobTypes.length] || 'Full-time',
        salaryPackage: {
          base: 500000 + (i * 50000),
          variable: 100000,
          currency: 'INR'
        },
        experienceRequired: `${i % 4} - ${(i % 4) + 3} years`,
        deadline: deadline,
        eligibilityCriteria: {
          minimumCgpa: 6 + (i % 3),
          allowedBranches: ['CSE', 'IT', 'ECE'],
          batchYears: [2024, 2025, 2026]
        },
        isActive: true,
      });
    }

    for (const jobData of jobsToCreate) {
      const existing = await jobModel.findOne({ 
        companyId: jobData.companyId, 
        roleId: jobData.roleId,
        title: jobData.title 
      });
      
      if (!existing) {
        await jobModel.create(jobData);
      }
    }
  });
}
