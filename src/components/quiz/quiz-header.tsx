import React from "react"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Clock, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/system/Breadcrumbs"

export interface QuizHeaderProps {
  courseName: string
  moduleName: string
  quizTitle: string
  estimatedTime: string
  currentQuestion: number
  totalQuestions: number
  onOpenMobileSidebar?: () => void
}

export function QuizHeader({
  courseName,
  moduleName,
  quizTitle,
  estimatedTime,
  currentQuestion,
  totalQuestions,
  onOpenMobileSidebar
}: QuizHeaderProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b">
      <div className="flex flex-col">
        <div className="h-16 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile menu trigger */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden mr-2 shrink-0" 
              onClick={onOpenMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col min-w-0">
              <div className="hidden md:block mb-1">
                <Breadcrumbs 
                  items={[
                    { label: courseName, href: "#" },
                    { label: moduleName, href: "#" }
                  ]}
                />
              </div>
              <h1 className="font-bold text-base md:text-lg truncate tracking-tight">{quizTitle}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6 shrink-0 pl-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime}</span>
            </div>
            <div className="text-sm font-bold bg-background border px-3 py-1.5 rounded-full shadow-sm">
              Question {currentQuestion} of {totalQuestions}
            </div>
          </div>
        </div>
        
        {/* Full width progress bar at bottom edge of header */}
        <div className="w-full h-1 bg-border/50">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </header>
  )
}
