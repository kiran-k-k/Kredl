import { PlacementDriveType } from "@/types/tpo"

export const MOCK_TPO_DRIVES: PlacementDriveType[] = [
  {
    id: "drive-001",
    companyName: "Microsoft",
    role: "Software Development Engineer",
    eligibleBranches: ["CS", "IT"],
    driveDate: "Oct 15, 2026",
    registrationStatus: "Open",
    applicantCount: 342,
    status: "Upcoming",
    packageRange: "₹45 LPA"
  },
  {
    id: "drive-002",
    companyName: "TCS",
    role: "Ninja & Digital Profile",
    eligibleBranches: ["All Branches"],
    driveDate: "Sep 20, 2026",
    registrationStatus: "Closed",
    applicantCount: 1205,
    status: "Ongoing",
    packageRange: "₹3.36 - ₹7 LPA"
  },
  {
    id: "drive-003",
    companyName: "Amazon",
    role: "SDE-1",
    eligibleBranches: ["CS", "IT", "EC"],
    driveDate: "Aug 10, 2026",
    registrationStatus: "Closed",
    applicantCount: 450,
    status: "Completed",
    packageRange: "₹44 LPA"
  },
  {
    id: "drive-004",
    companyName: "L&T Infotech",
    role: "Graduate Engineer Trainee",
    eligibleBranches: ["Mechanical", "Civil", "Electrical"],
    driveDate: "Nov 05, 2026",
    registrationStatus: "Open",
    applicantCount: 156,
    status: "Upcoming",
    packageRange: "₹6 LPA"
  }
]
