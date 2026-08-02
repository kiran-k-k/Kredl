"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, User, Bell, Palette, Lock, RefreshCw, Save, Briefcase, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"

export default function SettingsPage() {
  const { fetchUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    education: "",
    careerGoal: "",
    profilePictureUrl: "",
  })

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/me")
      return res.data?.data || res.data
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        location: profile.profile?.location || "",
        education: profile.profile?.education || "",
        careerGoal: profile.profile?.careerGoal || "",
        profilePictureUrl: profile.profilePictureUrl || profile.profileImage || "",
      })
    }
  }, [profile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB on frontend
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    try {
      setIsUploadingImage(true)
      const uploadData = new FormData()
      uploadData.append("file", file)

      const res = await api.post("/users/me/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      
      const imageUrl = res.data?.data?.profileImage || res.data?.profileImage
      setFormData(prev => ({ ...prev, profilePictureUrl: imageUrl }))
      toast.success("Profile image updated successfully")
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      // We should also notify the auth store to fetch the user again to update the header
      await fetchUser()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        profilePictureUrl: data.profilePictureUrl,
        profile: {
          ...profile?.profile,
          location: data.location,
          education: data.education,
          careerGoal: data.careerGoal
        }
      }
      const res = await api.put("/users/me", payload)
      return res.data
    },
    onSuccess: () => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: () => {
      toast.error("Failed to update profile")
    }
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Failed to load settings.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
          
          <TabsList className="flex md:flex-col justify-start h-auto bg-transparent border-0 space-y-1 w-full md:w-64 shrink-0 overflow-x-auto pb-4 md:pb-0">
            <TabsTrigger value="account" className="w-full justify-start gap-3 py-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-sm">
              <User className="h-4 w-4" /> Account
            </TabsTrigger>
            <TabsTrigger value="career" className="w-full justify-start gap-3 py-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-sm">
              <Briefcase className="h-4 w-4" /> Career Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start gap-3 py-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-3 py-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="w-full justify-start gap-3 py-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-sm">
              <Palette className="h-4 w-4" /> Appearance
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">
            <TabsContent value="account" className="mt-0 space-y-8">
              <form onSubmit={handleSave} className="p-8 border rounded-2xl bg-background shadow-sm space-y-6">
                <h2 className="text-xl font-bold border-b pb-4">Profile Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input value={formData.email} disabled />
                    <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Profile Image</label>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={formData.profilePictureUrl} alt="Avatar" />
                        <AvatarFallback className="bg-primary/5 text-primary text-xl">
                          {formData.firstName?.[0]}{formData.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                          {isUploadingImage ? "Uploading..." : "Upload New Image"}
                        </Button>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Pune, India" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Education / University</label>
                    <Input 
                      value={formData.education} 
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      placeholder="e.g. Pune University" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Career Goal</label>
                  <Input 
                    value={formData.careerGoal} 
                    onChange={(e) => setFormData({...formData, careerGoal: e.target.value})}
                    placeholder="e.g. Frontend Developer" 
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="career" className="mt-0">
              <div className="p-8 border rounded-2xl bg-background shadow-sm text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Career Profile</h3>
                <p className="text-muted-foreground mt-2 mb-6">Manage your career goals, education, skills, and learning preferences.</p>
                <Button onClick={() => window.location.href = "/onboarding"}>Edit Career Profile</Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="p-8 border rounded-2xl bg-background shadow-sm text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Security Settings</h3>
                <p className="text-muted-foreground mt-2">Manage your password and 2FA settings here (Coming soon).</p>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <div className="p-8 border rounded-2xl bg-background shadow-sm text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Notification Preferences</h3>
                <p className="text-muted-foreground mt-2">Manage email and push notifications (Coming soon).</p>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <div className="p-8 border rounded-2xl bg-background shadow-sm text-center">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Appearance</h3>
                <p className="text-muted-foreground mt-2">Dark mode and theme settings (Coming soon).</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  )
}
