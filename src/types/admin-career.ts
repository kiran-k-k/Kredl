export type CompanyStatus = "Actively Hiring" | "Not Hiring" | "Archived"

export interface CompanyType {
  id: string
  name: string
  logo?: string
  industry: string
  hiringType: "Fresher" | "Experienced" | "Both"
  processStatus: CompanyStatus
  lastUpdated: string
  // Audit fields
  createdAt: string
  updatedAt: string
  createdBy: string
  // Drawer Details
  overview: string
  eligibility: string[]
  skills: string[]
  interviewStages: string[]
  salaryRange: string
  faqs: { question: string; answer: string }[]
}

export type JobStatus = "Active" | "Expired" | "Draft"

export interface JobType {
  id: string
  title: string
  companyId: string
  companyName: string
  companyLogo?: string
  location: string
  experienceRequired: string
  jobType: "Remote" | "Onsite" | "Hybrid"
  salaryRange: string
  lastDate: string
  status: JobStatus
  // Audit fields
  createdAt: string
  updatedAt: string
  createdBy: string
  // Drawer Details
  description: string
  skills: string[]
  eligibility: string
  applyLink: string
  tags: string[]
}

export type AnnouncementStatus = "Draft" | "Scheduled" | "Published"
export type AnnouncementPriority = "Low" | "Medium" | "High"

export interface AnnouncementType {
  id: string
  title: string
  message: string
  targetAudience: "All Students" | "Specific Course" | "TPO"
  datePosted: string
  priority: AnnouncementPriority
  status: AnnouncementStatus
  // Audit fields
  createdAt: string
  updatedAt: string
  createdBy: string
}
