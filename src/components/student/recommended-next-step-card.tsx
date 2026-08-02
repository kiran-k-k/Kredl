import React from "react"
import { ArrowRight, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export interface RecommendedStepProps {
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export function RecommendedNextStepCard({
  title,
  description,
  actionLabel,
  actionHref
}: RecommendedStepProps) {
  return (
    <div className="p-6 border rounded-2xl bg-primary/5 shadow-sm border-primary/20 relative overflow-hidden flex flex-col items-start group hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-primary font-bold mb-3">
        <Compass className="h-5 w-5" />
        <span>Recommended Next Step</span>
      </div>
      
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
        {description}
      </p>
      
      <Button variant="default" className="gap-2 group-hover:gap-3 transition-all" asChild>
        <Link href={actionHref}>
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
