"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Trim whitespace from email
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      // Get the callback URL from query params or default to home
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/"
      
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        // Provide more specific error messages
        console.error("Sign in error:", result.error)
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (result.error.includes("Database") || result.error.includes("connection")) {
          setError("Database connection error. Please try again in a moment.")
        } else {
          setError(`Login failed: ${result.error}. Please try again or contact support.`)
        }
        setLoading(false)
        return
      }

      if (result?.ok) {
        // Use the callback URL or default to home, then redirect to role-based dashboard
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError("Login failed. Please try again.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(`An error occurred: ${errorMessage}. Please try again.`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="outline">
            Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo/images.jpeg" 
              alt="LSLS Logo" 
              className="h-16 w-16 rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold">LSLS Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <p className="text-xs text-gray-500">Enter your email address (not username)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
          
          {/* Credential Hints */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs font-semibold text-blue-900 mb-2">Credential Hints:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use your registered email address</li>
              <li>• Password must be at least 6 characters</li>
              <li>• Contact admin if you forgot your password</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

