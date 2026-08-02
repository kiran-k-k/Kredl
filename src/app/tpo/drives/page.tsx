"use client"

import React, { useState } from "react"
import { TpoLayout } from "@/components/layout/tpo-layout"
import { Plus, Search, Filter, Calendar, Users, Briefcase, ArrowRight, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MOCK_TPO_DRIVES } from "@/lib/tpo-data/drives.mock"
import { PlacementDriveType } from "@/types/tpo"
import { PageHeader } from "@/components/system/PageHeader"
import { StatusBadge } from "@/components/system/StatusBadge"
import { EmptyState } from "@/components/system/EmptyState"

export default function TpoDrivesPage() {
  const [drives] = useState<PlacementDriveType[]>(MOCK_TPO_DRIVES)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDrives = drives.filter(d => 
    d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRegistrationColor = (status: string) => {
    switch(status) {
      case "Open": return "text-success"
      case "Closed": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  return (
    <TpoLayout>
      <PageHeader 
        title="Placement Drives" 
        description="Manage ongoing and upcoming recruitment drives."
        action={
          <Button className="gap-2 shrink-0 bg-primary rounded-xl">
            <Plus className="h-4 w-4" /> Create Drive
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            aria-label="Search drives"
            placeholder="Search drives by company or role..." 
            className="pl-9 h-11 sm:h-10 bg-background shadow-sm rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select aria-label="Filter by status" className="h-11 sm:h-10 w-full sm:w-auto rounded-xl border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option>All Statuses</option>
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
          <Button variant="outline" className="h-11 sm:h-10 gap-2 rounded-xl">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrives.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Briefcase}
              title="No drives found"
              description="We couldn't find any placement drives matching your criteria."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
              className="bg-background border shadow-sm"
            />
          </div>
        ) : (
          filteredDrives.map(drive => (
            <div key={drive.id} className="bg-background border rounded-xl p-6 shadow-sm flex flex-col hover:border-primary/30 transition-colors group">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border shadow-sm rounded-xl">
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold rounded-xl">
                      {drive.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{drive.companyName}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{drive.role}</p>
                  </div>
                </div>
                <StatusBadge status={drive.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border/50">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</span>
                  <span className="text-sm font-bold">{drive.driveDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> Package</span>
                  <span className="text-sm font-bold text-success">{drive.packageRange}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Applicants</span>
                  <span className="text-sm font-bold">{drive.applicantCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">Registration</span>
                  <span className={`text-sm font-bold ${getRegistrationColor(drive.registrationStatus)}`}>{drive.registrationStatus}</span>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Eligible Branches:</p>
                <div className="flex flex-wrap gap-2">
                  {drive.eligibleBranches.map((branch, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-surface border text-foreground">
                      {branch}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

    </TpoLayout>
  )
}
