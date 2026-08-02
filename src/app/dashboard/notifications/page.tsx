"use client"

import React, { useState } from "react"
import { Bell, Briefcase, PlayCircle, Megaphone, Trash2, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState("all") // all, unread

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const res = await api.get(`/notifications?limit=50${filter === "unread" ? "&unreadOnly=true" : ""}`)
      return res.data?.data?.notifications || res.data?.notifications || []
    },
  })

  // Optionally implement mutation to mark as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  })

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (error) => {
      console.error("Failed to delete notification", error);
    }
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "job": return <Briefcase className="h-5 w-5 text-blue-500" />
      case "course": return <PlayCircle className="h-5 w-5 text-purple-500" />
      case "system": return <Bell className="h-5 w-5 text-orange-500" />
      default: return <Megaphone className="h-5 w-5 text-green-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "job": return "bg-blue-500/10"
      case "course": return "bg-purple-500/10"
      case "system": return "bg-orange-500/10"
      default: return "bg-green-500/10"
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your latest alerts and messages.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>Unread</Button>
          <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/10" onClick={async () => {
            await api.patch('/notifications/read-all');
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border bg-background shadow-sm overflow-hidden divide-y">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>Failed to load notifications.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : data?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications found.</p>
          </div>
        ) : (
          data.map((notification: any) => (
            <div 
              key={notification.id} 
              className={cn(
                "p-4 md:p-6 flex gap-4 transition-colors hover:bg-muted/50",
                !notification.isRead ? "bg-primary/5" : ""
              )}
            >
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", getBgColor(notification.type))}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-semibold truncate", !notification.isRead && "text-primary")}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                
                {!notification.isRead && !notification.isGlobal && (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 mt-2 text-primary"
                    onClick={() => markAsRead.mutate(notification.id)}
                    disabled={markAsRead.isPending && markAsRead.variables === notification.id}
                  >
                    {markAsRead.isPending && markAsRead.variables === notification.id ? 'Marking...' : 'Mark as read'}
                  </Button>
                )}
              </div>
              
              {!notification.isGlobal && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => deleteNotification.mutate(notification.id)}
                  disabled={deleteNotification.isPending && deleteNotification.variables === notification.id}
                >
                  {deleteNotification.isPending && deleteNotification.variables === notification.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
