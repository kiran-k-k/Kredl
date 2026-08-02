import React from "react"
import { Building2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export interface TargetCompanyProps {
  id: string
  name: string
  prepStatus: number
  difficulty: "High" | "Medium" | "Low"
}

export function TargetCompanyCard({
  id,
  name,
  prepStatus,
  difficulty
}: TargetCompanyProps) {
  const difficultyColors = {
    High: "text-destructive bg-destructive/10 border-destructive/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low: "text-success bg-success/10 border-success/20"
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-surface border flex items-center justify-center shrink-0">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-sm mb-1">{name}</h3>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${difficultyColors[difficulty]}`}>
            <AlertCircle className="h-3 w-3" /> {difficulty} Difficulty
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:block w-32">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase mb-1">
            <span>Prep</span>
            <span>{prepStatus}%</span>
          </div>
          <Progress value={prepStatus} className="h-1.5" />
        </div>
        
        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
          <Link href={`/companies/${id}`}>View Guide</Link>
        </Button>
      </div>
    </div>
  )
}
