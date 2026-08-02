"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/ui/password-input"
import { OAuthButton } from "@/components/auth/oauth-button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login({ email, password })
      const { user } = useAuthStore.getState()
      if (user?.roleName === 'Admin') {
        router.push('/admin')
      } else if (user?.roleName === 'TPO') {
        router.push('/tpo')
      } else {
        if (user && !user.profileCompleted) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      const data = err.response?.data;
      const errorDetail = data?.errors?.[0];
      setError(errorDetail || data?.message || err.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">
            Continue your learning journey.
          </p>
        </div>

        <div className="grid gap-6">
          <OAuthButton provider="google">
            Continue with Google
          </OAuthButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline hover:underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 my-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  Remember me for 30 days
                </label>
              </div>
              <Button className="w-full h-11 text-base mt-2" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
