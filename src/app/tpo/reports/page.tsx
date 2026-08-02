"use client"

import React from "react"
import { TpoLayout } from "@/components/layout/tpo-layout"
import { Download, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TpoReportsPage() {
  
  return (
    <TpoLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed insights into placement performance.</p>
        </div>
        <div className="flex gap-2">
          <select className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <option>Batch 2026</option>
            <option>Batch 2025</option>
            <option>Batch 2024</option>
          </select>
          <Button className="gap-2 shrink-0 bg-primary">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Placement Rate by Branch (Mock Chart) */}
        <div className="bg-background border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg">Branch-wise Placement</h2>
            <Button variant="ghost" size="icon" className="text-muted-foreground"><Info className="h-4 w-4" /></Button>
          </div>
          
          <div className="space-y-6">
            {[
              { branch: "Computer Science", rate: 85, total: 240, placed: 204 },
              { branch: "Information Technology", rate: 78, total: 120, placed: 94 },
              { branch: "Electronics", rate: 65, total: 180, placed: 117 },
              { branch: "Mechanical", rate: 45, total: 150, placed: 67 }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">{item.branch}</span>
                  <span className="font-bold text-primary">{item.rate}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.rate}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground text-right">{item.placed} / {item.total} Placed</p>
              </div>
            ))}
          </div>
        </div>

        {/* Year over Year Trend (Mock Chart) */}
        <div className="bg-background border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-lg">Year-over-Year Growth</h2>
            <span className="flex items-center gap-1 text-success text-sm font-bold bg-success/10 px-2 py-1 rounded-md">
              <TrendingUp className="h-4 w-4" /> +12.5%
            </span>
          </div>

          <div className="h-[250px] w-full flex items-end justify-between gap-4 px-2 border-b border-l border-muted pt-4 pb-0 relative mt-4">
            {/* Y-axis labels mock */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted-foreground -ml-6 py-2">
              <span>90%</span>
              <span>60%</span>
              <span>30%</span>
              <span>0%</span>
            </div>
            {/* Bars */}
            {[
              { year: "2023", value: 55 },
              { year: "2024", value: 68 },
              { year: "2025", value: 72 },
              { year: "2026", value: 85 }
            ].map((item, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end group">
                <div className="w-full bg-primary/20 rounded-t-md group-hover:bg-primary transition-colors relative cursor-pointer" style={{ height: `${item.value}%` }}>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold py-1 px-2 rounded pointer-events-none transition-opacity">
                    {item.value}%
                  </div>
                </div>
                <div className="text-center mt-2 text-xs font-bold text-muted-foreground absolute -bottom-6 w-full">{item.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Statistics */}
      <div className="bg-background border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-6">Package Statistics (Batch 2026)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Highest Package</p>
            <p className="text-4xl font-black text-primary">₹45.0 <span className="text-xl font-bold text-muted-foreground">LPA</span></p>
            <p className="text-xs text-muted-foreground mt-2">Microsoft (SDE-1)</p>
          </div>
          <div className="p-6 bg-surface border rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-success"></div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Average Package</p>
            <p className="text-4xl font-black">₹6.8 <span className="text-xl font-bold text-muted-foreground">LPA</span></p>
            <p className="text-xs text-success font-medium flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" /> +15% from last year
            </p>
          </div>
          <div className="p-6 bg-surface border rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Median Package</p>
            <p className="text-4xl font-black">₹5.5 <span className="text-xl font-bold text-muted-foreground">LPA</span></p>
            <p className="text-xs text-muted-foreground mt-2">Across all branches</p>
          </div>
        </div>
      </div>
      
    </TpoLayout>
  )
}
