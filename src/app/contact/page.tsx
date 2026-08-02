"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { DashboardService } from "@/lib/dashboard.service"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // In a real app, you might want to create a specific service method for this
      // But for now, we can just use fetch directly
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success("Message sent successfully! We will get back to you soon.")
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      toast.error("Failed to send message. Please try again later.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column: Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Get in touch.
              </h1>
              <p className="text-xl text-muted-foreground mb-12">
                Have questions about our roadmaps, want to partner as a hiring company, or just want to say hi? We'd love to hear from you.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface border">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email</h3>
                    <p className="text-muted-foreground mb-1">Our friendly team is here to help.</p>
                    <a href="mailto:hello.kredl@gmail.com" className="text-primary font-medium hover:underline">hello.kredl@gmail.com</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface border">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">WhatsApp</h3>
                    <p className="text-muted-foreground mb-1">Message us directly on WhatsApp.</p>
                    <a href="https://wa.me/919322424121" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">+91 93224 24121</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-surface border rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className="bg-background" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us a little about your inquiry..."
                  ></textarea>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting this form, you agree to our Privacy Policy.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
