"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    classNumber: "",
    parentName: "",
  })

  // Fetch student data
  useEffect(() => {
    if (!studentId) return

    const fetchData = async () => {
      try {
        setLoadingData(true)
        const studentRes = await fetch(`/api/students/${studentId}`)

        if (studentRes.ok) {
          const studentData = await studentRes.json()
          // Extract class number from class name (e.g., "Class 5" -> "5")
          const classNumber = studentData.class?.name?.replace("Class ", "") || ""
          const parentName = studentData.parent?.user?.name || ""
          
          setFormData({
            name: studentData.user?.name || "",
            email: studentData.user?.email || "",
            password: "",
            confirmPassword: "",
            classNumber: classNumber,
            parentName: parentName,
          })
        } else {
          setError("Failed to load student data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please refresh the page.")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [studentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      // Include class number and parent name
      updateData.classNumber = formData.classNumber || null
      updateData.parentName = formData.parentName || null

      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "Failed to update student"
        if (data.error) {
          if (typeof data.error === "string") {
            errorMessage = data.error
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error
              .map((e: any) => (typeof e === "string" ? e : e.message || JSON.stringify(e)))
              .join(", ")
          } else if (typeof data.error === "object") {
            errorMessage = data.error.message || JSON.stringify(data.error)
          }
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      router.push(`/admin/students/${studentId}`)
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Student</h1>
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/students/${studentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Student</h1>
          <p className="text-gray-600">Update student information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Update the student's details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Must be at least 6 characters if provided</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classNumber">Class</Label>
                <Select
                  value={formData.classNumber || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classNumber: value || "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Class {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  type="text"
                  placeholder="Enter parent name (optional)"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Student"}
              </Button>
              <Link href={`/admin/students/${studentId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

