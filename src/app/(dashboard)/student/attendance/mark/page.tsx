"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function MarkAttendancePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [student, setStudent] = useState<{ id: string; name: string; email: string } | null>(null)
  const [existingAttendance, setExistingAttendance] = useState<{ id: string; status: string } | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    // Fetch student details
    fetch("/api/students/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setStudent({ id: data.id, name: data.user.name, email: data.user.email })
        }
      })
      .catch((err) => {
        console.error("Failed to fetch student:", err)
      })
  }, [])

  useEffect(() => {
    // Check attendance when date or student changes
    if (student && date) {
      fetch(`/api/attendance?studentId=${student.id}&date=${date}`)
        .then((res) => res.json())
        .then((attendanceData) => {
          if (Array.isArray(attendanceData) && attendanceData.length > 0) {
            const dateAttendance = attendanceData.find((a: any) => {
              const attendanceDate = new Date(a.date).toISOString().split('T')[0]
              return attendanceDate === date
            })
            if (dateAttendance) {
              setExistingAttendance({ id: dateAttendance.id, status: dateAttendance.status })
              setStatus(dateAttendance.status)
            } else {
              setExistingAttendance(null)
              setStatus("")
            }
          } else {
            setExistingAttendance(null)
            setStatus("")
          }
        })
        .catch((err) => console.error("Failed to fetch attendance:", err))
    }
  }, [date, student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSuccess(false)

    if (!status) {
      setError("Please select an attendance status")
      setLoading(false)
      return
    }

    if (!student) {
      setError("Student information not found")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          status,
          date: date || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = existingAttendance 
          ? "Failed to update attendance" 
          : "Failed to mark attendance"
        if (data.error) {
          if (typeof data.error === "string") {
            errorMessage = data.error
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.map((e: any) => 
              typeof e === "string" ? e : e.message || JSON.stringify(e)
            ).join(", ")
          }
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      setTimeout(() => {
        router.push("/student/attendance")
        router.refresh()
      }, 1500)
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/student/attendance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {existingAttendance ? "Update Attendance" : "Mark Attendance"}
          </h1>
          <p className="text-gray-600">
            {student ? `Mark your attendance for ${student.name}` : "Select attendance status"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                Attendance {existingAttendance ? "updated" : "marked"} successfully!
              </div>
            )}

            {student && (
              <div className="space-y-2">
                <Label>Student</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setExistingAttendance(null)
                  setStatus("")
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">You can mark attendance for today or past dates</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Attendance Status *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Present
                    </div>
                  </SelectItem>
                  <SelectItem value="LATE">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Late
                    </div>
                  </SelectItem>
                  <SelectItem value="ABSENT">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Absent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/student/attendance">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (existingAttendance ? "Updating..." : "Marking...") 
                  : (existingAttendance ? "Update Attendance" : "Mark Attendance")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

