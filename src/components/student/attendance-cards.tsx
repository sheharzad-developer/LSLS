"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface AttendanceCardsProps {
  studentId: string
  todayAttendance?: { id: string; status: string } | null
}

export function AttendanceCards({ studentId, todayAttendance }: AttendanceCardsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleMarkAttendance = async (status: "PRESENT" | "LATE" | "ABSENT") => {
    setError("")
    setLoading(status)
    setSuccess(false)

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          status,
          date: new Date().toISOString().split('T')[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = "Failed to mark attendance"
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
        setLoading(null)
        return
      }

      setSuccess(true)
      setLoading(null)
      
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 1500)
    } catch (error) {
      setError("An error occurred. Please try again.")
      setLoading(null)
    }
  }

  const attendanceCards = [
    {
      status: "PRESENT" as const,
      label: "Present",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      hoverColor: "hover:border-green-500 hover:bg-green-50",
      description: "Mark as present",
    },
    {
      status: "LATE" as const,
      label: "Late",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      hoverColor: "hover:border-yellow-500 hover:bg-yellow-50",
      description: "Mark as late",
    },
    {
      status: "ABSENT" as const,
      label: "Absent",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      hoverColor: "hover:border-red-500 hover:bg-red-50",
      description: "Mark as absent",
    },
  ]

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
          Attendance marked successfully!
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">
          {todayAttendance ? "Update Today's Attendance" : "Mark Today's Attendance"}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {attendanceCards.map((card) => {
            const Icon = card.icon
            const isSelected = todayAttendance?.status === card.status
            const isLoading = loading === card.status

            return (
              <Card
                key={card.status}
                onClick={() => !isLoading && handleMarkAttendance(card.status)}
                className={`
                  cursor-pointer border-2 transition-all duration-300 transform hover:-translate-y-1
                  ${isSelected ? `${card.borderColor} ${card.bgColor} shadow-lg` : `border-gray-200 ${card.hoverColor}`}
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${card.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 ${isLoading ? "animate-pulse" : ""}`}>
                    <Icon className={`h-8 w-8 ${card.color}`} />
                  </div>
                  <h4 className={`text-xl font-bold mb-1 ${card.color}`}>
                    {card.label}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                  {isLoading && (
                    <p className="text-xs text-gray-500">Marking...</p>
                  )}
                  {isSelected && !isLoading && (
                    <p className="text-xs text-green-600 font-medium">✓ Current Status</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

