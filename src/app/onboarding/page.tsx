"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import StepEducation from "@/components/onboarding/StepEducation"
import StepCareerGoals from "@/components/onboarding/StepCareerGoals"
import StepDreamCompanies from "@/components/onboarding/StepDreamCompanies"
import StepCurrentSkills from "@/components/onboarding/StepCurrentSkills"
import StepSkillLevel from "@/components/onboarding/StepSkillLevel"
import StepLearningPreferences from "@/components/onboarding/StepLearningPreferences"
import StepPlacementPreparation from "@/components/onboarding/StepPlacementPreparation"
import StepSummary from "@/components/onboarding/StepSummary"

export interface OnboardingData {
  currentStatus: string;
  education: string;
  branch: string;
  graduationYear: number | "";
  preferredJobRoles: string[];
  preferredCompanies: string[];
  currentSkills: string[];
  skillLevel: string;
  programmingConfidence: number | "";
  dailyStudyGoal: string;
  learningStyle: string;
  preferredStudyTime: string[];
  placementGoal: string;
  joiningTimeline: string;
  aptitudeLevel: string;
  communicationLevel: string;
  resumeReady: boolean;
  githubProfile: string;
  linkedinProfile: string;
  portfolioWebsite: string;
}

const defaultData: OnboardingData = {
  currentStatus: "",
  education: "",
  branch: "",
  graduationYear: "",
  preferredJobRoles: [],
  preferredCompanies: [],
  currentSkills: [],
  skillLevel: "",
  programmingConfidence: "",
  dailyStudyGoal: "",
  learningStyle: "",
  preferredStudyTime: [],
  placementGoal: "",
  joiningTimeline: "",
  aptitudeLevel: "",
  communicationLevel: "",
  resumeReady: false,
  githubProfile: "",
  linkedinProfile: "",
  portfolioWebsite: "",
}

export default function OnboardingPage() {
  const router = useRouter()
  const { fetchUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(defaultData)
  const [isSaving, setIsSaving] = useState(false)
  const totalSteps = 8

  // Load any existing draft or saved profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/users/career-profile")
        if (res.data) {
          setData(prev => ({ ...prev, ...res.data }))
        }
      } catch (err) {
        // Ignore, maybe no profile exists yet
      }
    }
    loadProfile()
  }, [])

  const handleNext = async () => {
    // Auto-save logic here if desired
    if (step < totalSteps) {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleFinish = async () => {
    setIsSaving(true)
    try {
      await api.put("/users/career-profile", data)
      await fetchUser() // refresh auth store to get updated profileCompleted
      toast.success("Profile completed successfully!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateData = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <StepEducation data={data} updateData={updateData} />
      case 2: return <StepCareerGoals data={data} updateData={updateData} />
      case 3: return <StepDreamCompanies data={data} updateData={updateData} />
      case 4: return <StepCurrentSkills data={data} updateData={updateData} />
      case 5: return <StepSkillLevel data={data} updateData={updateData} />
      case 6: return <StepLearningPreferences data={data} updateData={updateData} />
      case 7: return <StepPlacementPreparation data={data} updateData={updateData} />
      case 8: return <StepSummary data={data} setStep={setStep} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">Personalize Your Journey</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Help us understand your goals so we can tailor Kredl for you. Step {step} of {totalSteps}
          </p>
          <Progress value={(step / totalSteps) * 100} className="mt-4 h-2 w-full max-w-md mx-auto" />
        </div>

        <div className="bg-background py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          {renderStep()}

          <div className="mt-8 flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSaving}>
              Back
            </Button>
            
            <div className="space-x-3">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} disabled={isSaving}>
                Skip for now
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleFinish} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Finish & Go to Dashboard"}
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
