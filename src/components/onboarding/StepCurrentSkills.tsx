import React from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const SKILL_CATEGORIES = {
  Programming: ["Java", "Python", "C++", "C", "JavaScript"],
  Frontend: ["HTML", "CSS", "React", "Next.js"],
  Backend: ["Spring Boot", "Node.js", "Express"],
  Database: ["MySQL", "PostgreSQL", "MongoDB"],
  Cloud: ["AWS", "Azure", "GCP"],
  Tools: ["Git", "Docker", "Kubernetes", "Linux"]
}

export default function StepCurrentSkills({ data, updateData }: Props) {
  const [customSkill, setCustomSkill] = React.useState("")

  const toggleSkill = (skill: string) => {
    if (data.currentSkills.includes(skill)) {
      updateData({ currentSkills: data.currentSkills.filter(s => s !== skill) })
    } else {
      updateData({ currentSkills: [...data.currentSkills, skill] })
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !data.currentSkills.includes(customSkill.trim())) {
      updateData({ currentSkills: [...data.currentSkills, customSkill.trim()] })
      setCustomSkill("")
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">4. What are your current skills?</h3>
      
      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <Label className="text-muted-foreground">{category}</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge 
                  key={skill} 
                  variant={data.currentSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-2 pt-4 border-t">
          <Label>Other Skills</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="E.g. Rust, Go, Figma" 
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <Button type="button" onClick={addCustomSkill} variant="secondary">Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {data.currentSkills
              .filter(skill => !Object.values(SKILL_CATEGORIES).flat().includes(skill))
              .map(skill => (
                <Badge 
                  key={skill} 
                  variant="default"
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill} ✕
                </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
