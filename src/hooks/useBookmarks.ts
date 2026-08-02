import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"

export type BookmarkType = "job" | "course" | "role" | "company"

export function useBookmarksList() {
  const { isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/bookmarks")
      const items = res.data?.data || res.data
      return Array.isArray(items) ? items : []
    },
    enabled: isAuthenticated
  })
}

export function useIsBookmarked(entityId: string | undefined) {
  const { data: bookmarks = [] } = useBookmarksList()
  if (!entityId || !Array.isArray(bookmarks)) return false
  return bookmarks.some((b: any) => b.entityId === entityId)
}

export function useToggleBookmark(entityId: string, entityType: BookmarkType) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => api.post("/bookmarks/toggle", { entityId, entityType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] })
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
      toast.success("Bookmark updated successfully!")
    },
    onError: () => {
      toast.error("Failed to update bookmark.")
    }
  })
}
