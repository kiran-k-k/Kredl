"use client"

import React from "react"
import { Search, SlidersHorizontal, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface FilterBarProps {
  placeholder?: string
  filters?: { label: string; active?: boolean }[]
  onSearch?: (term: string) => void
  onLocationChange?: (location: string) => void
  onFilterToggle?: (label: string) => void
  showLocation?: boolean
  defaultSearch?: string
  defaultLocation?: string
}

export function FilterBar({ 
  placeholder = "Search...", 
  filters = [], 
  onSearch,
  onLocationChange,
  onFilterToggle,
  showLocation = false,
  defaultSearch = "",
  defaultLocation = ""
}: FilterBarProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-3 p-2 bg-background border rounded-2xl shadow-sm mb-6">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input 
            defaultValue={defaultSearch}
            placeholder={placeholder}
            className="pl-11 h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-base"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        {showLocation && (
          <>
            <div className="hidden md:block w-px h-8 bg-border my-auto"></div>
            <div className="relative flex-1 flex items-center border-t md:border-none">
              <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                defaultValue={defaultLocation}
                placeholder="Location or 'Remote'" 
                className="pl-11 h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-base"
                onChange={(e) => onLocationChange?.(e.target.value)}
              />
            </div>
          </>
        )}
        <Button size="lg" className="h-12 px-8 rounded-xl shrink-0 w-full md:w-auto mt-2 md:mt-0">
          Search
        </Button>
      </div>

      {filters.length > 0 && (
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="text-muted-foreground shrink-0 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button 
                key={filter.label}
                onClick={() => onFilterToggle?.(filter.label)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors border ${
                  filter.active 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
