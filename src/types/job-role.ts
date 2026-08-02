// Shared TypeScript interfaces for Job Roles module
// Used across listing page, detail page, and admin page

export enum JobRoleCategory {
  SOFTWARE_DEVELOPMENT = 'Software Development',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  DATA_SCIENCE = 'Data Science',
  CLOUD_DEVOPS = 'Cloud & DevOps',
  CYBERSECURITY = 'Cybersecurity',
  EMBEDDED_SYSTEMS = 'Embedded Systems',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  UI_UX_DESIGN = 'UI/UX Design',
  NETWORKING = 'Networking',
  DATABASE_ADMINISTRATION = 'Database Administration',
}

export enum ExperienceLevel {
  FRESHER = 'Fresher',
  ZERO_TO_TWO = '0–2 Years',
  TWO_TO_FIVE = '2–5 Years',
  FIVE_PLUS = '5+ Years',
}

export interface SalaryInfo {
  country: string
  currency: string
  fresherRange: string
  averageSalary: string
  experiencedRange: string
}

export interface ResumeGuidance {
  requiredSections: string[]
  technicalSkills: string[]
  recommendedProjects: string[]
  recommendedCertifications: string[]
  resumeChecklist: string[]
  commonMistakes: string[]
}

export interface RoadmapStep {
  _id?: string
  title: string
  description: string
  durationWeeks: number
  courseId?: { _id: string; title: string; slug: string } | null
  moduleId?: { _id: string; title: string; slug: string } | null
}

export interface PopulatedCompany {
  _id: string
  name: string
  logo: string
  slug: string
  eligibilityCriteria?: {
    minimumCgpa: number
    allowedBranches: string[]
    requiredSkills: string[]
  }
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
}

export interface PopulatedProject {
  _id: string
  title: string
  shortDescription: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  technologies: string[]
  learningObjectives: string[]
  repositoryUrl?: string
}

// Lightweight shape used on listing cards
export interface JobRoleListItem {
  _id: string
  title: string
  slug: string
  shortDescription: string
  category: JobRoleCategory
  experienceLevel: ExperienceLevel
  estimatedLearningTime?: string
  isPublished: boolean
  isFeatured: boolean
  displayOrder: number
  requiredSkills: string[]
  salaryInfo?: SalaryInfo
  salaryRange?: string
  companiesHiring: Array<PopulatedCompany | string>
  recommendedProjects: Array<{ _id: string; title: string; difficulty: string } | string>
  roadmap: RoadmapStep[]
  createdAt: string
}

// Full shape for detail page
export interface JobRoleDetail extends JobRoleListItem {
  description: string
  preferredSkills: string[]
  responsibilities: string[]
  interviewTopics: Record<string, string[]>
  resumeGuidance?: ResumeGuidance
  companiesHiring: PopulatedCompany[]
  recommendedProjects: PopulatedProject[]
}
