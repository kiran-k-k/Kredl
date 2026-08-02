import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from '../src/modules/companies/schemas/company.schema';
import { runSeeder } from './utils';

export async function seedCompanies(app: INestApplicationContext) {
  await runSeeder('Companies', async () => {
    const companyModel = app.get<Model<any>>(getModelToken(Company.name));

    const companies = [
      {
        name: 'Google',
        logo: 'https://logo.clearbit.com/google.com',
        website: 'https://careers.google.com',
        description: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.',
        industry: 'Technology',
        locations: ['Mountain View, CA', 'Bangalore, India', 'Hyderabad, India'],
      },
      {
        name: 'Microsoft',
        logo: 'https://logo.clearbit.com/microsoft.com',
        website: 'https://careers.microsoft.com',
        description: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.',
        industry: 'Technology',
        locations: ['Redmond, WA', 'Bangalore, India', 'Hyderabad, India'],
      },
      {
        name: 'Amazon',
        logo: 'https://logo.clearbit.com/amazon.com',
        website: 'https://amazon.jobs',
        description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
        industry: 'Technology',
        locations: ['Seattle, WA', 'Bangalore, India', 'Hyderabad, India'],
      },
      {
        name: 'Netflix',
        logo: 'https://logo.clearbit.com/netflix.com',
        website: 'https://jobs.netflix.com',
        description: 'Netflix, Inc. is an American subscription video on-demand over-the-top streaming service and production company.',
        industry: 'Entertainment',
        locations: ['Los Gatos, CA', 'Mumbai, India'],
      },
      {
        name: 'Adobe',
        logo: 'https://logo.clearbit.com/adobe.com',
        website: 'https://adobe.com/careers',
        description: 'Adobe Inc. is an American multinational computer software company.',
        industry: 'Software',
        locations: ['San Jose, CA', 'Noida, India', 'Bangalore, India'],
      },
      {
        name: 'Oracle',
        logo: 'https://logo.clearbit.com/oracle.com',
        website: 'https://oracle.com/careers',
        description: 'Oracle Corporation is an American multinational computer technology corporation.',
        industry: 'Technology',
        locations: ['Austin, TX', 'Bangalore, India', 'Hyderabad, India'],
      },
      {
        name: 'IBM',
        logo: 'https://logo.clearbit.com/ibm.com',
        website: 'https://ibm.com/careers',
        description: 'International Business Machines Corporation is an American multinational technology corporation.',
        industry: 'Information Technology',
        locations: ['Armonk, NY', 'Bangalore, India', 'Pune, India'],
      },
      {
        name: 'Cisco',
        logo: 'https://logo.clearbit.com/cisco.com',
        website: 'https://cisco.com/careers',
        description: 'Cisco Systems, Inc. is an American multinational digital communications technology conglomerate corporation.',
        industry: 'Networking',
        locations: ['San Jose, CA', 'Bangalore, India'],
      },
      {
        name: 'Intel',
        logo: 'https://logo.clearbit.com/intel.com',
        website: 'https://intel.com/careers',
        description: 'Intel Corporation is an American multinational corporation and technology company.',
        industry: 'Semiconductors',
        locations: ['Santa Clara, CA', 'Bangalore, India'],
      },
      {
        name: 'Salesforce',
        logo: 'https://logo.clearbit.com/salesforce.com',
        website: 'https://salesforce.com/company/careers/',
        description: 'Salesforce, Inc. is an American cloud-based software company headquartered in San Francisco, California.',
        industry: 'Software',
        locations: ['San Francisco, CA', 'Bangalore, India', 'Hyderabad, India'],
      },
      {
        name: 'Atlassian',
        logo: 'https://logo.clearbit.com/atlassian.com',
        website: 'https://atlassian.com/company/careers',
        description: 'Atlassian Corporation is an Australian software company that develops products for software developers, project managers and other software development teams.',
        industry: 'Software',
        locations: ['Sydney, Australia', 'Bangalore, India'],
      },
      {
        name: 'Zoho',
        logo: 'https://logo.clearbit.com/zoho.com',
        website: 'https://zoho.com/careers',
        description: 'Zoho Corporation is an Indian multinational technology company that makes web-based business tools.',
        industry: 'Software',
        locations: ['Chennai, India', 'Austin, TX'],
      },
      {
        name: 'Infosys',
        logo: 'https://logo.clearbit.com/infosys.com',
        website: 'https://infosys.com/careers',
        description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
        industry: 'IT Services',
        locations: ['Bangalore, India', 'Pune, India', 'Hyderabad, India'],
      },
      {
        name: 'TCS',
        logo: 'https://logo.clearbit.com/tcs.com',
        website: 'https://tcs.com/careers',
        description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
        industry: 'IT Services',
        locations: ['Mumbai, India', 'Bangalore, India', 'Pune, India', 'Chennai, India'],
      },
      {
        name: 'Accenture',
        logo: 'https://logo.clearbit.com/accenture.com',
        website: 'https://accenture.com/careers',
        description: 'Accenture plc is an Irish-American professional services company based in Dublin, specializing in information technology services and consulting.',
        industry: 'Consulting & IT',
        locations: ['Dublin, Ireland', 'Bangalore, India', 'Mumbai, India'],
      },
      {
        name: 'Wipro',
        logo: 'https://logo.clearbit.com/wipro.com',
        website: 'https://wipro.com/careers',
        description: 'Wipro Limited is an Indian multinational corporation that provides information technology, consulting and business process services.',
        industry: 'IT Services',
        locations: ['Bangalore, India', 'Pune, India'],
      },
      {
        name: 'Capgemini',
        logo: 'https://logo.clearbit.com/capgemini.com',
        website: 'https://capgemini.com/careers',
        description: 'Capgemini SE is a French multinational information technology services and consulting company.',
        industry: 'IT Services',
        locations: ['Paris, France', 'Mumbai, India', 'Bangalore, India'],
      },
      {
        name: 'Cognizant',
        logo: 'https://logo.clearbit.com/cognizant.com',
        website: 'https://cognizant.com/careers',
        description: 'Cognizant is an American multinational information technology services and consulting company.',
        industry: 'IT Services',
        locations: ['Teaneck, NJ', 'Chennai, India', 'Pune, India'],
      }
    ];

    for (const companyData of companies) {
      const existing = await companyModel.findOne({ name: companyData.name });
      if (!existing) {
        await companyModel.create({
            ...companyData,
            isActive: true
        });
      }
    }
  });
}
