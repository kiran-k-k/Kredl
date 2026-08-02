"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams?.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid or missing reset token. Please request a new password reset link.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus("error")
      setMessage("Passwords do not match.")
      return
    }
    
    if (!token) return

    setStatus("loading")
    setMessage("")
    
    try {
      await api.post("/auth/reset-password", { token, newPassword: password })
      setStatus("success")
      setMessage("Your password has been successfully reset. You can now login with your new password.")
    } catch (err: any) {
      setStatus("error")
      setMessage(err.response?.data?.message || "Failed to reset password. The link might be expired.")
    }
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your new password below."
    >
      {status === "success" ? (
        <div className="bg-primary/10 text-primary p-4 rounded-xl border border-primary/20 flex flex-col gap-4 text-center">
          <p className="font-medium text-sm leading-relaxed">{message}</p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput 
              id="password" 
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput 
              id="confirmPassword" 
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {status === "error" && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
              {message}
              {!token && (
                <div className="mt-2">
                  <Link href="/forgot-password" className="underline font-bold">
                    Go to Forgot Password
                  </Link>
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold"
            disabled={status === "loading" || !password || !confirmPassword || !token}
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
