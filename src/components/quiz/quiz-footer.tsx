import React from "react"
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface QuizFooterProps {
  isFirstQuestion: boolean
  isLastQuestion: boolean
  onPrevious: () => void
  onNext: () => void
  onSaveAndContinue: () => void
  onSubmit: () => void
}

export function QuizFooter({
  isFirstQuestion,
  isLastQuestion,
  onPrevious,
  onNext,
  onSaveAndContinue,
  onSubmit
}: QuizFooterProps) {
  return (
    <footer className="sticky bottom-0 z-40 bg-surface/90 backdrop-blur-md border-t p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="w-full sm:w-auto gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        
        <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="lg"
            onClick={onSaveAndContinue}
            className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground"
          >
            <Save className="h-4 w-4" /> Save & Continue
          </Button>
          
          {isLastQuestion ? (
            <Button 
              variant="default" 
              size="lg"
              onClick={onSubmit}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
            >
              Submit Quiz <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="lg"
              onClick={onNext}
              className="w-full sm:w-auto gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
      </div>
    </footer>
  )
}
