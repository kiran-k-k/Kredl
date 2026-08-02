import { TpoAnnouncementType, ActivityType } from "@/types/tpo"

export const MOCK_TPO_ANNOUNCEMENTS: TpoAnnouncementType[] = [
  {
    id: "tpo-ann-1",
    title: "Infosys Campus Drive Registration",
    message: "Registration for Infosys campus drive is now open. All eligible students must apply through the portal before the deadline.",
    datePosted: "Jul 05, 2026",
    targetAudience: "All Students",
    isPinned: true
  },
  {
    id: "tpo-ann-2",
    title: "Resume Review Session",
    message: "The placement cell is organizing a resume review session with industry experts this Friday. Bring a hard copy of your resume.",
    datePosted: "Jul 03, 2026",
    targetAudience: "Final Year",
    isPinned: false
  },
  {
    id: "tpo-ann-3",
    title: "Mock Interview Schedule - CS/IT",
    message: "Mock interview slots for CS and IT branches have been published on the notice board. Please check your assigned timings.",
    datePosted: "Jul 01, 2026",
    targetAudience: "Specific Branch",
    isPinned: false
  }
]

export const MOCK_TPO_ACTIVITY: ActivityType[] = [
  {
    id: "act-1",
    title: "New Placement Drive Added",
    description: "Microsoft SDE role added for 2026 batch",
    timestamp: "2 hours ago",
    type: "drive"
  },
  {
    id: "act-2",
    title: "Student Placed",
    description: "Sneha Reddy placed in Amazon at ₹44 LPA",
    timestamp: "5 hours ago",
    type: "student"
  },
  {
    id: "act-3",
    title: "Announcement Posted",
    description: "Infosys Campus Drive Registration",
    timestamp: "1 day ago",
    type: "announcement"
  },
  {
    id: "act-4",
    title: "Drive Completed",
    description: "Amazon SDE-1 drive completed",
    timestamp: "2 days ago",
    type: "drive"
  }
]
