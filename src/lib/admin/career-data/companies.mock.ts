import { CompanyType } from "@/types/admin-career"

export const MOCK_COMPANIES: CompanyType[] = [
  {
    id: "comp-1",
    name: "Google",
    industry: "Product",
    hiringType: "Both",
    processStatus: "Actively Hiring",
    lastUpdated: "Today at 10:30 AM",
    createdAt: "Jan 10, 2026",
    updatedAt: "Jul 05, 2026",
    createdBy: "Kiran Kendre",
    overview: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.",
    eligibility: ["B.Tech/BE in CS/IT", "65% and above in 10th and 12th", "No active backlogs"],
    skills: ["Data Structures", "Algorithms", "System Design", "Go", "C++"],
    interviewStages: ["Online Assessment", "Technical Interview 1", "Technical Interview 2", "Googlyness (HR)"],
    salaryRange: "₹25LPA - ₹40LPA",
    faqs: [
      { question: "Are competitive programming skills required?", answer: "Yes, strong algorithmic skills are highly recommended." }
    ]
  },
  {
    id: "comp-2",
    name: "TCS",
    industry: "IT Services",
    hiringType: "Fresher",
    processStatus: "Actively Hiring",
    lastUpdated: "Yesterday",
    createdAt: "Feb 14, 2026",
    updatedAt: "Jul 04, 2026",
    createdBy: "Admin User",
    overview: "Tata Consultancy Services is an Indian multinational information technology services and consulting company.",
    eligibility: ["B.Tech all branches", "60% consistent across academics"],
    skills: ["Java", "SQL", "Communication"],
    interviewStages: ["TCS NQT", "Technical Interview", "HR Interview"],
    salaryRange: "₹3.36LPA - ₹7LPA",
    faqs: []
  },
  {
    id: "comp-3",
    name: "Microsoft",
    industry: "Product",
    hiringType: "Experienced",
    processStatus: "Not Hiring",
    lastUpdated: "Last week",
    createdAt: "Mar 01, 2026",
    updatedAt: "Jun 28, 2026",
    createdBy: "Admin User",
    overview: "Microsoft Corporation is an American multinational technology corporation.",
    eligibility: ["2+ years experience", "B.Tech CS/IT"],
    skills: ["C#", ".NET", "Azure", "System Design"],
    interviewStages: ["Screening", "Technical Loop", "As-Approp (HR)"],
    salaryRange: "₹20LPA - ₹35LPA",
    faqs: []
  }
]
