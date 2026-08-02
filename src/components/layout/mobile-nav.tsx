"use client"

import React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function MobileNav({ isOpen, setIsOpen }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 border-r bg-background">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <Sidebar onNavigate={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
