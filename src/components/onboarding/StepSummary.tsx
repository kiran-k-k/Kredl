import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/app/onboarding/page'
import { Edit } from 'lucide-react'

interface Props {
  data: OnboardingData;
  setStep: (step: number) => void;
}

const Section = ({ title, step, children, setStep }: { title: string, step: number, children: React.ReactNode, setStep: (step: number) => void }) => (
  <div className="py-4 border-b last:border-0 relative">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold text-muted-foreground">{title}</h4>
      <Button variant="ghost" size="sm" onClick={() => setStep(step)} className="h-6 px-2 text-xs">
        <Edit className="h-3 w-3 mr-1" /> Edit
      </Button>
    </div>
    <div className="text-sm">
      {children}
    </div>
  </div>
)

export default function StepSummary({ data, setStep }: Props) {

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">8. Review your profile</h3>
      <p className="text-sm text-muted-foreground">Make sure everything looks good. You can edit these details later from your settings.</p>
      
      <div className="bg-surface rounded-xl p-6 border shadow-sm space-y-2">
        <Section setStep={setStep} title="Education" step={1}>
          <p>{data.currentStatus ? `${data.currentStatus}, ` : ""}{data.education || "No degree"} in {data.branch || "Unknown branch"} {data.graduationYear ? `(${data.graduationYear})` : ""}</p>
        </Section>

        <Section setStep={setStep} title="Career Goals" step={2}>
          <p><span className="font-medium">Roles:</span> {data.preferredJobRoles.join(", ") || "None selected"}</p>
          <p><span className="font-medium">Goal:</span> {data.placementGoal || "Not specified"} ({data.joiningTimeline || "No timeline"})</p>
        </Section>

        <Section setStep={setStep} title="Dream Companies" step={3}>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.preferredCompanies.length > 0 
              ? data.preferredCompanies.map(c => <Badge key={c} variant="secondary">{c}</Badge>)
              : "None selected"}
          </div>
        </Section>

        <Section setStep={setStep} title="Skills & Level" step={4}>
          <p><span className="font-medium">Level:</span> {data.skillLevel || "Not specified"} (Confidence: {data.programmingConfidence || "-"})</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {data.currentSkills.length > 0 
              ? data.currentSkills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)
              : "No skills added"}
          </div>
        </Section>

        <Section setStep={setStep} title="Learning Preferences" step={6}>
          <p>{data.dailyStudyGoal || "No time goal"} via {data.learningStyle || "No style"} ({data.preferredStudyTime.join(", ") || "Anytime"})</p>
        </Section>

        <Section setStep={setStep} title="Placement Prep" step={7}>
          <p>Aptitude: {data.aptitudeLevel || "-"} | Communication: {data.communicationLevel || "-"}</p>
          <p>Resume Ready: {data.resumeReady ? "Yes" : "No"}</p>
        </Section>
      </div>
    </div>
  )
}
