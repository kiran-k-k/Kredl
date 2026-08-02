import React from "react"
import { cn } from "@/lib/utils"
import { Silkscreen } from "next/font/google"

const silkscreen = Silkscreen({ 
  weight: "400",
  subsets: ["latin"] 
})

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-black tracking-tighter flex items-baseline select-none text-foreground drop-shadow-sm", silkscreen.className, className)}>
      <span className="text-[1.4em] leading-none">K</span>
      <span className="text-[1em] leading-none -ml-[0.05em]">redl</span>
    </span>
  )
}
