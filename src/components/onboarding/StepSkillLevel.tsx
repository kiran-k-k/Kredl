import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export default function StepSkillLevel({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">5. Assess your skill level</h3>
      
      <div className="space-y-8">
        <div className="space-y-2">
          <Label>Overall Experience Level</Label>
            {/* @ts-ignore */}
          <Select value={data.skillLevel} onValueChange={(val) => updateData({ skillLevel: val })}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner (0-1 years)</SelectItem>
              <SelectItem value="Intermediate">Intermediate (1-3 years)</SelectItem>
              <SelectItem value="Advanced">Advanced (3+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <Label>Programming Confidence (1-10)</Label>
            <span className="font-bold text-lg text-primary">{data.programmingConfidence || "-"}</span>
          </div>
          <Slider 
            value={[typeof data.programmingConfidence === 'number' ? data.programmingConfidence : 5]} 
            min={1} 
            max={10} 
            step={1}
            onValueChange={(val) => updateData({ programmingConfidence: Array.isArray(val) ? val[0] : val })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Just starting</span>
            <span>Very confident</span>
          </div>
        </div>
      </div>
    </div>
  )
}
