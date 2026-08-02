"use client"

import React, { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Settings, Save, Shield, Bell, Mail, Database, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Settings saved successfully")
    }, 1000)
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "email", label: "Email Config", icon: Mail },
    { id: "advanced", label: "Advanced", icon: Database },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global platform configuration and preferences.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <div className="bg-background border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Platform Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
                    <Input defaultValue="Kredl" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Support Email</label>
                    <Input defaultValue="support@kredl.dev" type="email" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                    <Input defaultValue="+91 9876543210" className="rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-background border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Security Preferences</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Session Timeout (minutes)</label>
                    <Input defaultValue="120" type="number" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Max Failed Login Attempts</label>
                    <Input defaultValue="5" type="number" className="rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "notifications" || activeTab === "email" || activeTab === "advanced") && (
            <div className="bg-background border rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <Settings className="h-12 w-12 text-muted-foreground opacity-20" />
              <div>
                <h3 className="text-lg font-bold">Under Construction</h3>
                <p className="text-muted-foreground text-sm mt-1">This settings panel is coming in a future update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
