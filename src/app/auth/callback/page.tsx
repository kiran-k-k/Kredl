"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setAccessToken } = useAuthStore()
  const [error, setError] = useState("")

  useEffect(() => {
    // Extract token from URL fragment (hash)
    const hash = window.location.hash
    if (!hash) {
      setError("No authentication token found")
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    // Hash looks like #token=eyJhbGci...
    const params = new URLSearchParams(hash.substring(1)) // remove the #
    const token = params.get("token")

    if (token) {
      // Store token
      setAccessToken(token)
      // Redirect to dashboard
      router.push("/dashboard")
    } else {
      setError("Invalid authentication token")
      setTimeout(() => router.push("/login"), 3000)
    }
  }, [router, setAccessToken])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {error ? (
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">Redirecting to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold">Completing login...</h2>
          <p className="text-muted-foreground">Please wait while we redirect you.</p>
        </div>
      )}
    </div>
  )
}
