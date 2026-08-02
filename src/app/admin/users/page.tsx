"use client"

import React, { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Search, Filter, MoreHorizontal, Check, Trash2, Edit, Eye, Loader2, AlertCircle, Link2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Student")
  const [viewUser, setViewUser] = useState<any>(null)
  
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10, search }
      if (roleFilter !== "all") params.role = roleFilter
      if (statusFilter !== "all") params.status = statusFilter
      const res = await api.get('/admin/users', { params })
      return res.data?.data || res.data
    }
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: string }) => {
      const { data } = await api.post(`/admin/users/invite`, { email, role })
      return data.data || data
    },
    onSuccess: (data) => {
      if (data?.user?.tempPassword) {
        toast.success(`User invited! Temporary password: ${data.user.tempPassword}`, {
          duration: 10000,
        })
      } else {
        toast.success("Invitation sent successfully!")
      }
      setInviteOpen(false)
      setInviteEmail("")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send invitation")
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/admin/users/${id}/status`, { status })
    },
    onSuccess: () => {
      toast.success("User status updated")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error("Failed to update status")
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      toast.success("User deleted")
      setSelectedUsers([])
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error("Failed to delete user")
  })

  const generateLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/users/${id}/reset-password-link`)
      return res.data?.data?.resetUrl || res.data?.resetUrl
    },
    onSuccess: async (url) => {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Reset link copied to clipboard!", { description: url })
      } catch (err) {
        toast.success("Reset link generated! Please copy it below:", { 
          description: url,
          duration: 10000 // Show longer so they have time to copy
        })
      }
    },
    onError: () => toast.error("Failed to generate reset link")
  })

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u: any) => u._id))
    }
  }

  const handleDeleteMany = () => {
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      selectedUsers.forEach(id => deleteMutation.mutate(id))
    }
  }

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform students and administrators.</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger className={buttonVariants({ variant: "default", size: "default", className: "gap-2 shrink-0" })}>
            Invite User
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="TPO">TPO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button disabled={inviteMutation.isPending || !inviteEmail} onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}>
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-9 h-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-full sm:w-[130px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="TPO">TPO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-full sm:w-[130px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedUsers.length > 0 && (
          <div className="bg-primary/5 border-b p-3 flex items-center justify-between px-6">
            <span className="text-sm font-bold text-primary">{selectedUsers.length} users selected</span>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" className="h-8 gap-2" onClick={handleDeleteMany}>
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading users...</p>
            </div>
          ) : isError ? (
             <div className="flex flex-col items-center justify-center h-[400px] text-destructive">
              <AlertCircle className="h-8 w-8 mb-4" />
              <p>Failed to load users.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-muted cursor-pointer"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-muted cursor-pointer"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-muted-foreground">{user.roleId?.name || 'N/A'}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span> {user.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setViewUser(user)}><Eye className="h-4 w-4" /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            if (confirm('Generate password reset link?')) generateLinkMutation.mutate(user._id)
                          }}
                          title="Generate Reset Link"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm('Delete this user?')) deleteMutation.mutate(user._id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        {!isLoading && !isError && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50 rounded-b-2xl">
            <span>Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} entries</span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">{page}</Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold uppercase">
                    {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-xl">{viewUser.firstName} {viewUser.lastName}</h3>
                  <p className="text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="font-medium">{viewUser.roleId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-medium">{viewUser.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Joined Date</p>
                  <p className="font-medium">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ID</p>
                  <p className="font-medium text-xs truncate" title={viewUser._id}>{viewUser._id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </AdminLayout>
  )
}
