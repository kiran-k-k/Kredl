import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const ROLES = [
  "Full Stack Java Developer", "Full Stack Python Developer", "AI Engineer", 
  "Data Scientist", "IoT Engineer", "DevOps Engineer", "Cloud Engineer", 
  "Frontend Developer", "Backend Developer"
]

export default function StepCareerGoals({ data, updateData }: Props) {
  const toggleRole = (role: string) => {
    if (data.preferredJobRoles.includes(role)) {
      updateData({ preferredJobRoles: data.preferredJobRoles.filter(r => r !== role) })
    } else {
      updateData({ preferredJobRoles: [...data.preferredJobRoles, role] })
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">2. Define your career goals</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Preferred Job Roles (Select multiple)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {ROLES.map(role => (
              <Badge 
                key={role} 
                variant={data.preferredJobRoles.includes(role) ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3"
                onClick={() => toggleRole(role)}
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label>Placement Goal</Label>
            {/* @ts-ignore */}
            {/* @ts-ignore */}
            <Select value={data.placementGoal || undefined} onValueChange={(val) => updateData({ placementGoal: val })}>
              <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="6+ LPA">6+ LPA</SelectItem>
                <SelectItem value="10+ LPA">10+ LPA</SelectItem>
                <SelectItem value="20+ LPA">20+ LPA</SelectItem>
                <SelectItem value="Dream Company">Dream Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Expected Joining Timeline</Label>
            {/* @ts-ignore */}
            {/* @ts-ignore */}
            <Select value={data.joiningTimeline || undefined} onValueChange={(val) => updateData({ joiningTimeline: val })}>
              <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediately">Immediately</SelectItem>
                <SelectItem value="3 Months">3 Months</SelectItem>
                <SelectItem value="6 Months">6 Months</SelectItem>
                <SelectItem value="1 Year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
