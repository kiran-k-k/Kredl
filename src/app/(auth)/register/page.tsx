"use client"

import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/ui/password-input"
import { OAuthButton } from "@/components/auth/oauth-button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuthStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const [firstName, ...lastNameParts] = name.split(" ")
      const lastName = lastNameParts.join(" ") || "User"
      await register({ firstName, lastName, email, password })
      router.push('/login?registered=true')
    } catch (err: any) {
      const data = err.response?.data;
      const errorDetail = data?.errors?.[0];
      setError(errorDetail || data?.message || err.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground text-sm">
            Start building your career today.
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
                Or register with email
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  className="bg-background"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Visual Password Strength Indicator (UI only) */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-1/3 bg-destructive"></div>
                  </div>
                  <div className="flex items-start flex-col gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" /> Minimum 8 characters
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <div className="h-3 w-3 rounded-full border border-current mr-1 opacity-50"></div> 
                      At least one number or symbol
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-start space-x-2 my-2">
                <Checkbox id="terms" className="mt-1" />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  I accept the{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms and Conditions</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </label>
              </div>
              <Button className="w-full h-11 text-base mt-2" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
