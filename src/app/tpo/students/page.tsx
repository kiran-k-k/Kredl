"use client"

import React, { useState } from "react"
import { TpoLayout } from "@/components/layout/tpo-layout"
import { Search, Filter, Download, Users, Eye, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MOCK_TPO_STUDENTS } from "@/lib/tpo-data/students.mock"
import { StudentType } from "@/types/tpo"
import { PageHeader } from "@/components/system/PageHeader"
import { DataTable, ColumnDef } from "@/components/system/DataTable"
import { StatusBadge } from "@/components/system/StatusBadge"
import { EmptyState } from "@/components/system/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"

export default function TpoStudentsPage() {
  const [students] = useState<StudentType[]>(MOCK_TPO_STUDENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: ColumnDef<StudentType>[] = [
    {
      header: "Student",
      cell: (s) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {s.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Branch & Year",
      cell: (s) => (
        <div>
          <p className="font-medium">{s.branch}</p>
          <p className="text-xs text-muted-foreground">{s.year}</p>
        </div>
      )
    },
    {
      header: "CGPA",
      align: "center",
      cell: (s) => (
        <span className={`font-bold ${s.cgpa >= 8.0 ? 'text-success' : s.cgpa >= 7.0 ? 'text-warning' : 'text-destructive'}`}>
          {s.cgpa}
        </span>
      )
    },
    {
      header: "Top Skills",
      hideOnMobile: true,
      cell: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.skills.slice(0, 2).map((skill, i) => (
            <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface border">
              {skill}
            </span>
          ))}
          {s.skills.length > 2 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted border text-muted-foreground">
              +{s.skills.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Status",
      cell: (s) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={s.placementStatus} />
          {s.placedCompany && (
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="h-3 w-3" /> {s.placedCompany}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Action",
      align: "right",
      cell: (s) => (
        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/10 rounded-xl">
          <Eye className="h-4 w-4" /> Profile
        </Button>
      )
    }
  ]

  return (
    <TpoLayout>
      <PageHeader 
        title="Students" 
        description="Manage and track student placement readiness."
        action={
          <Button variant="outline" className="gap-2 shrink-0 rounded-xl">
            <Download className="h-4 w-4" /> Export List
          </Button>
        }
      />

      <div className="bg-background border rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              aria-label="Search students"
              placeholder="Search by name, email, or branch..." 
              className="pl-9 h-11 sm:h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select aria-label="Filter by branch" className="h-11 sm:h-10 w-full sm:w-auto rounded-xl border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>All Branches</option>
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Electronics</option>
              <option>Mechanical</option>
            </select>
            <select aria-label="Filter by status" className="h-11 sm:h-10 w-full sm:w-auto rounded-xl border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>All Statuses</option>
              <option>Placed</option>
              <option>Not Placed</option>
              <option>Interviewing</option>
            </select>
            <Button variant="outline" className="h-11 sm:h-10 gap-2 rounded-xl">
              <Filter className="h-4 w-4" /> More Filters
            </Button>
          </div>
        </div>

        {/* Data Area */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState 
              icon={Users}
              title="No students found"
              description="We couldn't find any students matching your search criteria."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
              className="border-none bg-transparent"
            />
          ) : (
            <DataTable 
              data={filteredStudents} 
              columns={columns} 
              keyExtractor={(s) => s.id}
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      </div>
    </TpoLayout>
  )
}
