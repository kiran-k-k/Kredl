import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { RouteGuard } from "@/components/auth/route-guard"

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-surface text-foreground">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />

          {/* Main Viewport */}
          <main className="flex-1 overflow-y-auto bg-surface relative">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  )
}
