export interface JobSalary {
  min: number;
  max: number;
  currency: string;
  period: 'LPA' | 'Monthly' | 'Hourly';
}

export interface JobEligibilityCriteria {
  minimumCgpa: number;
  allowedBranches: string[];
  batchYears: number[];
}

export interface Job {
  _id: string;
  title: string;
  companyId: {
    _id: string;
    name: string;
    logo?: string;
    description?: string;
  };
  roleId: {
    _id: string;
    title: string;
    description?: string;
  };
  location: string;
  employmentType: string;
  workMode: string;
  experienceRequired: string;
  jobSummary: string;
  requiredSkills: string[];
  salary?: JobSalary;
  eligibilityCriteria?: JobEligibilityCriteria;
  applyUrl?: string;
  deadline: string;
  status: 'Draft' | 'Active' | 'Archived' | 'Expired';
  createdAt: string;
  updatedAt: string;
  companySnapshot?: {
    name: string;
    logo?: string;
    website?: string;
  };
}
