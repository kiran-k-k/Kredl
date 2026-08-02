import { AnnouncementType } from "@/types/admin-career"

export const MOCK_ANNOUNCEMENTS: AnnouncementType[] = [
  {
    id: "ann-1",
    title: "TCS NQT 2026 Registration Open",
    message: "Tata Consultancy Services has officially opened registrations for the National Qualifier Test (NQT) for the 2026 batch. All eligible students must apply before the deadline.",
    targetAudience: "All Students",
    datePosted: "Jul 05, 2026",
    priority: "High",
    status: "Published",
    createdAt: "Jul 05, 2026",
    updatedAt: "Jul 05, 2026",
    createdBy: "Kiran Kendre",
  },
  {
    id: "ann-2",
    title: "Resume Building Workshop",
    message: "Join our upcoming live session on how to craft an ATS-friendly resume for FAANG companies. Limited slots available.",
    targetAudience: "Specific Course",
    datePosted: "Jul 04, 2026",
    priority: "Medium",
    status: "Published",
    createdAt: "Jul 04, 2026",
    updatedAt: "Jul 04, 2026",
    createdBy: "Admin User",
  },
  {
    id: "ann-3",
    title: "Amazon Off-Campus Drive Results",
    message: "The results for the recent Amazon off-campus drive will be announced next week. Shortlisted candidates will receive an email.",
    targetAudience: "All Students",
    datePosted: "Jul 08, 2026",
    priority: "Low",
    status: "Scheduled",
    createdAt: "Jul 03, 2026",
    updatedAt: "Jul 05, 2026",
    createdBy: "Admin User",
  }
]
