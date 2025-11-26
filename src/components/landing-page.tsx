"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GraduationCap, Users, UserCircle } from "lucide-react"

type Role = "TEACHER" | "STUDENT" | "PARENT" | null

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setError("")
    setEmail("")
    setPassword("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      if (result?.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (selectedRole === "TEACHER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Login</h2>
              <p className="text-gray-600">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRole(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/signup")}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Sign up
          </Button>
        </div>
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo/images.jpeg" 
              alt="LSLS Logo" 
              className="h-20 w-20 rounded-lg object-cover shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to LSLS</h1>
          <p className="text-lg text-gray-600">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Teacher Card */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-300"
            onClick={() => handleRoleSelect("TEACHER")}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teacher</h3>
              <p className="text-gray-600 text-sm mb-4">Access your teaching dashboard</p>
              <Button className="w-full">Login</Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-green-300"
            onClick={() => router.push("/login?role=STUDENT")}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-lg">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600 text-sm mb-4">View your academic progress</p>
              <Button className="w-full" variant="outline">Login</Button>
            </CardContent>
          </Card>

          {/* Parent Card */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-purple-300"
            onClick={() => router.push("/login?role=PARENT")}
          >
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-lg">
                  <UserCircle className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Parents</h3>
              <p className="text-gray-600 text-sm mb-4">Track your children's progress</p>
              <Button className="w-full" variant="outline">Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

