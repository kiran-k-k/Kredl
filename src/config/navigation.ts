import { 
  LayoutDashboard, 
  Library, 
  Bookmark, 
  Bell, 
  User, 
  Settings, 
  Building2,
  BookOpen,
  Briefcase
} from "lucide-react"

export const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/courses", icon: Library },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Job Roles", href: "/job-roles", icon: BookOpen },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
]

export const BOTTOM_SIDEBAR_ITEMS = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Edit Career Profile", href: "/onboarding", icon: Briefcase },
]
