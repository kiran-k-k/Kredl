export type PlacementStatus = "Placed" | "Not Placed" | "Interviewing"

export interface StudentType {
  id: string
  name: string
  email: string
  branch: string
  year: string
  cgpa: number
  skills: string[]
  placementStatus: PlacementStatus
  placedCompany?: string
  avatar?: string
}

export type DriveStatus = "Upcoming" | "Ongoing" | "Completed"

export interface PlacementDriveType {
  id: string
  companyName: string
  companyLogo?: string
  role: string
  eligibleBranches: string[]
  driveDate: string
  registrationStatus: "Open" | "Closed"
  applicantCount: number
  status: DriveStatus
  packageRange: string
}

export type AnnouncementTarget = "All Students" | "Specific Branch" | "Final Year"

export interface TpoAnnouncementType {
  id: string
  title: string
  message: string
  datePosted: string
  targetAudience: AnnouncementTarget
  isPinned: boolean
}

export interface ActivityType {
  id: string
  title: string
  description: string
  timestamp: string
  type: "drive" | "student" | "announcement"
}
