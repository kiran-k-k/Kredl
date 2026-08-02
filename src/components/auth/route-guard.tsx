"use client"

import React, { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useRouter, usePathname } from "next/navigation"

export function RouteGuard({ 
  children,
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading, isInitialized, fetchUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isInitialized) {
      fetchUser()
    }
  }, [isInitialized, fetchUser])


  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        if (pathname?.startsWith("/dashboard")) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
      } else {
        if (pathname?.startsWith('/dashboard') && user?.roleName === 'Admin') {
          router.replace('/admin')
        } else if (pathname?.startsWith('/dashboard') && user?.roleName === 'TPO') {
          router.replace('/tpo')
        } else if (allowedRoles && user && user.roleName && !allowedRoles.includes(user.roleName.toLowerCase()) && !allowedRoles.includes(user.roleName)) {
          router.replace("/unauthorized")
        }
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, allowedRoles, router, pathname])

  // While checking auth state for the first time, show a loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Verifying session...</p>
        </div>
      </div>
    )
  }

  // If we verified they aren't authenticated and they are on a protected route,
  // we render nothing while the redirect happens
  if (!isAuthenticated && pathname?.startsWith("/dashboard")) {
    return null
  }

  // If authenticated but role mismatch redirecting to specific dashboards
  if (isAuthenticated && pathname?.startsWith("/dashboard")) {
    if (user?.roleName === 'Admin') return null;
    if (user?.roleName === 'TPO') return null;
  }

  // If authenticated but unauthorized, render nothing while redirect happens
  if (isAuthenticated && user && allowedRoles && user.roleName && !allowedRoles.includes(user.roleName.toLowerCase()) && !allowedRoles.includes(user.roleName)) {
    return null
  }

  // If authenticated or not on a protected route, render the content
  return <>{children}</>
}
