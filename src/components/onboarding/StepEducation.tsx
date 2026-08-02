import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export default function StepEducation({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">1. Tell us about your current status</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Current Status</Label>
            {/* @ts-ignore */}
          <Select value={data.currentStatus} onValueChange={(val) => updateData({ currentStatus: val })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Graduate">Graduate</SelectItem>
              <SelectItem value="Working Professional">Working Professional</SelectItem>
              <SelectItem value="Career Switcher">Career Switcher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Highest Education</Label>
            {/* @ts-ignore */}
          <Select value={data.education} onValueChange={(val) => updateData({ education: val })}>
            <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="B.Tech">B.Tech</SelectItem>
              <SelectItem value="BCA">BCA</SelectItem>
              <SelectItem value="MCA">MCA</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
              <SelectItem value="BSc">BSc</SelectItem>
              <SelectItem value="BE">BE</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Branch / Specialization</Label>
            <Input 
              placeholder="e.g. Computer Science" 
              value={data.branch} 
              onChange={(e) => updateData({ branch: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Graduation Year</Label>
            <Input 
              type="number" 
              placeholder="e.g. 2026" 
              value={data.graduationYear} 
              onChange={(e) => updateData({ graduationYear: parseInt(e.target.value) || "" })} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
