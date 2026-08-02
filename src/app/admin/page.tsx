"use client"

import React from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Users, Library, FolderTree, PlaySquare, FileText, ArrowUpRight, Plus, Activity, UserPlus, AlertCircle, Database, Server, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboard()

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor platform health and content metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-background" onClick={() => alert("Report generation coming soon")}>Download Report</Button>
          <Button asChild className="gap-2">
            <Link href="/admin/courses">
              <Plus className="h-4 w-4" /> New Course
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between mb-8 border border-destructive/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load admin dashboard data. Some information may be unavailable.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-destructive/20 hover:bg-destructive/20 text-destructive">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Users", icon: Users, statKey: 'users' },
          { label: "Courses", icon: Library, statKey: 'courses' },
          { label: "Modules", icon: FolderTree, statKey: 'modules' },
          { label: "Lessons", icon: PlaySquare, statKey: 'lessons' },
          { label: "Notes", icon: FileText, statKey: 'notes' }
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-2xl border bg-background shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold">
                {data?.stats[item.statKey as keyof typeof data.stats]?.toLocaleString() || "0"}
              </h3>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border bg-background shadow-sm h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Activity</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.recentActivity && data.recentActivity.length > 0 ? (
                <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border space-y-6">
                  {data.recentActivity.map((act, i) => {
                    const Icon = act.type === 'CREATE' ? Plus : 
                                 act.type === 'UPDATE' ? Activity : 
                                 act.type === 'LOGIN' ? UserPlus : Activity;
                    return (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-full border-4 border-background ${act.color} shrink-0 z-10 flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-bold">{act.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{act.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Activity className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No recent activity.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-background shadow-sm">
            <h2 className="text-lg font-bold mb-4">System Status</h2>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-surface">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" /> Main API
                </span>
                {isLoading ? <Skeleton className="h-5 w-20" /> : (
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${data?.system.api === 'online' ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                    {data?.system.api || 'Unknown'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-surface">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" /> Database
                </span>
                {isLoading ? <Skeleton className="h-5 w-20" /> : (
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${data?.system.database === 'connected' ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                    {data?.system.database || 'Unknown'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-surface">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" /> Environment
                </span>
                {isLoading ? <Skeleton className="h-5 w-20" /> : (
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {data?.system.environment || 'Unknown'}
                  </span>
                )}
              </div>

            </div>
            
            {!isLoading && data?.system.lastChecked && (
              <p className="text-[10px] text-muted-foreground text-center mt-4 uppercase tracking-wider">
                Last checked: {new Date(data.system.lastChecked).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="p-6 rounded-2xl border bg-primary/5 border-primary/20 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-2">Quick Actions</h2>
            <div className="space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start text-foreground bg-background hover:bg-primary/10">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-foreground bg-background hover:bg-primary/10">
                <Link href="/admin/courses">Manage Courses</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-foreground bg-background hover:bg-primary/10">
                <Link href="/admin/quizzes">Manage Quizzes</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-foreground bg-background hover:bg-primary/10">
                <Link href="/admin/settings">System Settings</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>

    </AdminLayout>
  )
}
