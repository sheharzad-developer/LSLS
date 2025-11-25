"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default function NewTeacherPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    designation: "",
    name: "",
    email: "",
    classId: "",
    gender: "",
    password: "",
    phoneNumber: "",
    subject: "",
  })

  useEffect(() => {
    // Fetch classes
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data)
        }
      })
      .catch((err) => console.error("Failed to fetch classes:", err))
  }, [])

  const resetForm = () => {
    setFormData({
      designation: "",
      name: "",
      email: "",
      classId: "",
      gender: "",
      password: "",
      phoneNumber: "",
      subject: "",
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent, shouldAddAnother = false) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSuccess(false)

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          classIds: formData.classId ? [formData.classId] : [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "Failed to create teacher"
        if (data.error) {
          if (typeof data.error === "string") {
            errorMessage = data.error
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.map((e: any) => 
              typeof e === "string" ? e : e.message || JSON.stringify(e)
            ).join(", ")
          } else if (typeof data.error === "object") {
            errorMessage = data.error.message || JSON.stringify(data.error)
          }
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      if (shouldAddAnother) {
        setTimeout(() => {
          resetForm()
          setSuccess(false)
        }, 1500)
      } else {
        setTimeout(() => {
          router.push("/teacher")
          router.refresh()
        }, 1500)
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Teachers</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className="px-4 py-2 font-semibold text-gray-900 border-b-2 border-primary"
        >
          Manually
        </button>
        <button
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
          onClick={() => {
            // TODO: Implement CSV import
            alert("CSV import feature coming soon")
          }}
        >
          Import CSV
        </button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                Teacher added successfully!
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="e.g., Senior Teacher"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value || "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value || "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                Add another
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300">
                {loading ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

