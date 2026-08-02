"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Loader2, MessageSquare } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { toast } from "sonner"

interface Inquiry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { accessToken } = useAuthStore()

  const fetchInquiries = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/inquiries`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (!response.ok) throw new Error("Failed to fetch inquiries")
      const json = await response.json()
      setInquiries(json.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Could not load inquiries")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchInquiries()
    }
  }, [accessToken])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      toast.success("Inquiry deleted successfully")
      setInquiries(prev => prev.filter(inq => inq._id !== id))
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete inquiry")
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
            <p className="text-muted-foreground mt-1">
              Manage messages submitted through the contact page.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-surface">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No inquiries found</h3>
            <p className="text-muted-foreground">You don't have any messages yet.</p>
          </div>
        ) : (
          <div className="border rounded-xl bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry._id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {inquiry.firstName} {inquiry.lastName}
                    </TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.subject}</TableCell>
                    <TableCell className="max-w-xs truncate" title={inquiry.message}>
                      {inquiry.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(inquiry._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
