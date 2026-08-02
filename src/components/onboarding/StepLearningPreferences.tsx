import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"]

export default function StepLearningPreferences({ data, updateData }: Props) {
  const toggleTime = (time: string) => {
    if (data.preferredStudyTime.includes(time)) {
      updateData({ preferredStudyTime: data.preferredStudyTime.filter(t => t !== time) })
    } else {
      updateData({ preferredStudyTime: [...data.preferredStudyTime, time] })
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">6. How do you prefer to learn?</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Daily Study Time</Label>
            {/* @ts-ignore */}
            <Select value={data.dailyStudyGoal} onValueChange={(val) => updateData({ dailyStudyGoal: val })}>
              <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                <SelectItem value="1 Hour">1 Hour</SelectItem>
                <SelectItem value="2 Hours">2 Hours</SelectItem>
                <SelectItem value="3+ Hours">3+ Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Learning Style</Label>
            {/* @ts-ignore */}
            <Select value={data.learningStyle} onValueChange={(val) => updateData({ learningStyle: val })}>
              <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Videos">Videos</SelectItem>
                <SelectItem value="Notes">Notes</SelectItem>
                <SelectItem value="Projects">Projects</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label>Preferred Study Time (Select multiple)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIME_SLOTS.map(time => (
              <Badge 
                key={time} 
                variant={data.preferredStudyTime.includes(time) ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-4"
                onClick={() => toggleTime(time)}
              >
                {time}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
