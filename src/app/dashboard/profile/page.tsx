"use client"

import React from "react"
import { 
  MapPin, GraduationCap, Building, Edit, Mail, Calendar, 
  BookOpen, FileQuestion, Briefcase, Target, Trophy, Clock, 
  RefreshCw, Code2, Users, Globe, Flame 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import Link from "next/link"

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/users/me")
      return res.data?.data || res.data
    }
  })

  const { data: summary } = useQuery({
    queryKey: ["progress-summary"],
    queryFn: async () => {
      const res = await api.get("/dashboard/progress")
      return res.data?.data || res.data
    }
  })

  const { data: careerProfile } = useQuery({
    queryKey: ["career-profile"],
    queryFn: async () => {
      try {
        const res = await api.get("/users/career-profile")
        return res.data?.data || res.data
      } catch (err) {
        return null
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <RefreshCw className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 border rounded-3xl bg-background shadow-sm">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <BookOpen className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-muted-foreground text-center max-w-md">We couldn't retrieve your profile data. Please try again or contact support if the issue persists.</p>
        <Button onClick={() => refetch()} className="mt-2 rounded-full px-8">Try Again</Button>
      </div>
    )
  }

  const initials = profile?.firstName?.charAt(0) + (profile?.lastName?.charAt(0) || "")
  
  // Safely resolve the avatar URL, preventing literal "undefined" string
  let validAvatarUrl = undefined
  if (profile?.profileImage && profile.profileImage !== "undefined" && profile.profileImage !== "null") {
    validAvatarUrl = profile.profileImage
  } else if (profile?.profilePictureUrl && profile.profilePictureUrl !== "undefined" && profile.profilePictureUrl !== "null") {
    validAvatarUrl = profile.profilePictureUrl
  }

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        
        {/* Header Profile Card */}
        <div className="relative border rounded-3xl bg-background shadow-xl overflow-hidden group">
          {/* Vibrant Gradient Banner */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="relative pt-20 px-8 pb-8 flex flex-col md:flex-row gap-8 items-start md:items-end">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full translate-y-2 scale-90"></div>
              <Avatar className="h-32 w-32 border-4 border-background shadow-2xl relative z-10 bg-background transition-transform duration-500 hover:scale-105">
                <AvatarImage src={validAvatarUrl} className="object-cover" />
                <AvatarFallback className="text-4xl font-extrabold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                {profile?.profile?.careerGoal && (
                  <p className="text-primary font-medium flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" /> Career Goal: {profile.profile.careerGoal}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground/90">
                {(profile?.profile?.location || careerProfile?.location) && (
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <MapPin className="h-4 w-4 text-blue-500" /> {profile?.profile?.location || careerProfile?.location}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Mail className="h-4 w-4 text-purple-500" /> {profile?.email}
                </div>
                {(careerProfile?.education || profile?.profile?.education) && (
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Building className="h-4 w-4 text-emerald-500" /> {careerProfile?.education || profile?.profile?.education}
                  </div>
                )}
                {careerProfile?.graduationYear && (
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                    <GraduationCap className="h-4 w-4 text-amber-500" /> Class of {careerProfile.graduationYear}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Calendar className="h-4 w-4 text-rose-500" /> Member since {new Date(profile?.createdAt || Date.now()).getFullYear()}
                </div>
              </div>
            </div>
            
            <Button className="gap-2 w-full md:w-auto mt-4 md:mt-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-primary to-primary/80" asChild>
              <Link href="/dashboard/settings">
                <Edit className="h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            <section className="p-8 border rounded-3xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                Learning Journey
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                <div className="p-5 rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-4xl font-black mb-2 text-foreground group-hover:text-blue-600 transition-colors">{summary?.coursesCompleted || 0}</div>
                  <div className="text-sm font-medium text-muted-foreground">Courses Completed</div>
                </div>
                <div className="p-5 rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-4xl font-black mb-2 text-foreground group-hover:text-purple-600 transition-colors">{summary?.lessonsCompleted || 0}</div>
                  <div className="text-sm font-medium text-muted-foreground">Lessons Finished</div>
                </div>
                <div className="p-5 rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-4xl font-black mb-2 text-foreground group-hover:text-emerald-600 transition-colors">{summary?.hoursLearned || 0}</div>
                  <div className="text-sm font-medium text-muted-foreground">Hours of Learning</div>
                </div>
                <div className="p-5 rounded-2xl border bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group border-orange-200 dark:border-orange-900">
                  <div className="text-4xl font-black mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-500">
                    {summary?.learningStreak || 0} <Flame className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="text-sm font-medium text-orange-700/70 dark:text-orange-400/70">Day Streak</div>
                </div>
              </div>
            </section>

            <section className="p-8 border rounded-3xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                Achievements
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 rounded-2xl border bg-card/50 hover:bg-card transition-colors duration-300 group">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">Fast Learner</h4>
                    <p className="text-sm text-muted-foreground">Completed 5 modules in a single day.</p>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-0">Unlocked</Badge>
                </div>
                
                <div className="flex items-center gap-5 p-5 rounded-2xl border bg-card/50 hover:bg-card transition-colors duration-300 group">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">Perfect Score</h4>
                    <p className="text-sm text-muted-foreground">Scored 100% on a final assessment.</p>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-0">Unlocked</Badge>
                </div>

                <div className="flex items-center gap-5 p-5 rounded-2xl border bg-muted/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
                  <div className="h-14 w-14 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0">
                    <Briefcase className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">Career Ready</h4>
                    <p className="text-sm text-muted-foreground">Complete 3 placement-focused courses.</p>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">Locked</Badge>
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <section className="p-8 border rounded-3xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" /> Skills & Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {careerProfile?.currentSkills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-4 py-1.5 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-0 text-sm font-medium transition-colors">
                    {skill}
                  </Badge>
                ))}
                {(!careerProfile?.currentSkills || careerProfile.currentSkills.length === 0) && (
                  <p className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-xl w-full text-center border border-dashed">No skills added yet.</p>
                )}
              </div>
            </section>
            
            {(careerProfile?.preferredJobRoles?.length > 0 || careerProfile?.preferredCompanies?.length > 0) && (
              <section className="p-8 border rounded-3xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" /> Career Preferences
                </h2>
                
                {careerProfile.preferredJobRoles?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground flex items-center gap-2">
                      <span className="w-4 h-px bg-muted-foreground/30"></span> Target Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {careerProfile.preferredJobRoles.map((role: string) => (
                        <Badge key={role} variant="outline" className="px-3 py-1.5 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-500/5">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {careerProfile.preferredCompanies?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-muted-foreground flex items-center gap-2">
                      <span className="w-4 h-px bg-muted-foreground/30"></span> Dream Companies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {careerProfile.preferredCompanies.map((company: string) => (
                        <Badge key={company} variant="outline" className="px-3 py-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="p-8 border rounded-3xl bg-background shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" /> Web Links
              </h2>
              <div className="space-y-4">
                {careerProfile?.githubProfile ? (
                  <a href={careerProfile.githubProfile} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
                    <div className="h-10 w-10 rounded-full bg-[#24292e]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Code2 className="h-5 w-5 text-[#24292e] dark:text-white" />
                    </div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors">GitHub Profile</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 grayscale">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">No GitHub connected</span>
                  </div>
                )}

                {careerProfile?.linkedinProfile ? (
                  <a href={careerProfile.linkedinProfile} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
                    <div className="h-10 w-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-[#0077b5]" />
                    </div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors">LinkedIn Profile</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 grayscale">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">No LinkedIn connected</span>
                  </div>
                )}

                {careerProfile?.portfolioWebsite ? (
                  <a href={careerProfile.portfolioWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors">Portfolio Website</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl opacity-50 grayscale">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">No Portfolio connected</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

      </div>
    </>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
