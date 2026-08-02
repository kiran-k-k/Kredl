"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { api } from "@/lib/api"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [devUrl, setDevUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    
    try {
      const res = await api.post("/auth/forgot-password", { email })
      setStatus("success")
      setMessage(res.data?.data?.message || res.data?.message || "If your email is registered, a password reset link has been sent.")
      
      const resetUrl = res.data?.data?.devResetUrl || res.data?.devResetUrl
      if (resetUrl) {
        setDevUrl(resetUrl)
      }
    } catch (err: any) {
      setStatus("error")
      setMessage(err.response?.data?.message || "Failed to process request. Please try again.")
    }
  }

  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <div className="mb-6">
        <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>

      {status === "success" ? (
        <div className="bg-primary/10 text-primary p-4 rounded-xl border border-primary/20 flex flex-col gap-3">
          <p className="font-medium text-sm leading-relaxed">{message}</p>
          <p className="text-sm opacity-80">Please check your inbox and spam folder.</p>
          
          {devUrl && (
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded border border-primary/30">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary/80">Developer Mode Quick Link</p>
              <Link href={devUrl} className="text-sm font-medium underline text-primary">
                Click here to reset your password directly &rarr;
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {status === "error" && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold"
            disabled={status === "loading" || !email}
          >
            {status === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
