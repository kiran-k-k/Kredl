"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MoreVertical, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface CompanyReviewsProps {
  companyId: string
}

export function CompanyReviews({ companyId }: CompanyReviewsProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Form state
  const [rating, setRating] = useState(0)
  const [pros, setPros] = useState("")
  const [cons, setCons] = useState("")
  const [placementExperience, setPlacementExperience] = useState("")

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["company-reviews", companyId],
    queryFn: async () => {
      const response = await api.get(`/companies/${companyId}/reviews`)
      return response.data
    },
    enabled: !!companyId
  })

  const reviews = reviewsData?.data || []

  // Check if current user has already reviewed
  const existingReview = user ? reviews.find((r: any) => r.studentId === user._id || r.student?._id === user._id) : null

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/companies/${companyId}/reviews`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-reviews", companyId] })
      toast.success("Review submitted successfully")
      setShowReviewForm(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error submitting review")
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await api.patch(`/companies/${companyId}/reviews/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-reviews", companyId] })
      toast.success("Review updated successfully")
      setIsEditing(false)
      setEditingReview(null)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error updating review")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${companyId}/reviews/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-reviews", companyId] })
      toast.success("Review deleted successfully")
    }
  })

  const resetForm = () => {
    setRating(0)
    setPros("")
    setCons("")
    setPlacementExperience("")
  }

  const handleEditClick = (review: any) => {
    setEditingReview(review)
    setRating(review.rating)
    setPros(review.pros || "")
    setCons(review.cons || "")
    setPlacementExperience(review.placementExperience || "")
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Rating is required")
      return
    }

    const payload = { rating, pros, cons, placementExperience }

    if (isEditing && editingReview) {
      updateMutation.mutate({ id: editingReview._id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-border/50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Student Reviews</h2>
        {user?.roleName === 'STUDENT' && !existingReview && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
        )}
      </div>

      {(showReviewForm || isEditing) && (
        <div className="p-6 rounded-2xl border bg-surface">
          <h3 className="text-lg font-bold mb-4">{isEditing ? "Edit Your Review" : "Write a Review"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${rating >= star ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Pros</Label>
              <Textarea 
                value={pros} 
                onChange={(e) => setPros(e.target.value)} 
                placeholder="What did you like?"
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cons</Label>
              <Textarea 
                value={cons} 
                onChange={(e) => setCons(e.target.value)} 
                placeholder="What could be improved?"
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Placement Experience (Optional)</Label>
              <Textarea 
                value={placementExperience} 
                onChange={(e) => setPlacementExperience(e.target.value)} 
                placeholder="How was the interview process?"
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowReviewForm(false)
                setIsEditing(false)
                setEditingReview(null)
                resetForm()
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-surface border rounded-2xl">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: any) => (
            <div key={review._id} className="p-6 rounded-2xl border bg-background shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {review.student?.firstName?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{review.student?.firstName || 'Anonymous'} {review.student?.lastName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${review.rating >= star ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {(user?.roleName === 'ADMIN' || (user?._id === review.studentId) || (user?._id === review.student?._id)) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user && (user._id === review.studentId || user._id === review.student?._id) && (
                        <DropdownMenuItem onClick={() => handleEditClick(review)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10" 
                        onClick={() => {
                          if(confirm("Are you sure you want to delete this review?")) {
                            deleteMutation.mutate(review._id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="space-y-3">
                {review.pros && (
                  <div>
                    <h4 className="text-sm font-semibold text-success mb-1">Pros</h4>
                    <p className="text-sm text-muted-foreground">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-1">Cons</h4>
                    <p className="text-sm text-muted-foreground">{review.cons}</p>
                  </div>
                )}
                {review.placementExperience && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <h4 className="text-sm font-semibold mb-1">Placement Experience</h4>
                    <p className="text-sm text-muted-foreground">{review.placementExperience}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
