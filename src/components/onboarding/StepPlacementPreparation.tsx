import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export default function StepPlacementPreparation({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">7. Placement Preparation</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aptitude Level</Label>
            {/* @ts-ignore */}
            <Select value={data.aptitudeLevel} onValueChange={(val) => updateData({ aptitudeLevel: val })}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Needs Practice">Needs Practice</SelectItem>
                <SelectItem value="Average">Average</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Communication Skills</Label>
            {/* @ts-ignore */}
            <Select value={data.communicationLevel} onValueChange={(val) => updateData({ communicationLevel: val })}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Fluent">Fluent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Switch 
            id="resume-ready" 
            checked={data.resumeReady} 
            onCheckedChange={(checked) => updateData({ resumeReady: checked })} 
          />
          <Label htmlFor="resume-ready">My resume is up-to-date and ready</Label>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label>Profiles (Optional)</Label>
          <div className="space-y-3">
            <Input 
              placeholder="LinkedIn URL" 
              value={data.linkedinProfile} 
              onChange={(e) => updateData({ linkedinProfile: e.target.value })} 
            />
            <Input 
              placeholder="GitHub URL" 
              value={data.githubProfile} 
              onChange={(e) => updateData({ githubProfile: e.target.value })} 
            />
            <Input 
              placeholder="Portfolio Website" 
              value={data.portfolioWebsite} 
              onChange={(e) => updateData({ portfolioWebsite: e.target.value })} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
