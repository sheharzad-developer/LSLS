import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ParentChildrenPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          user: true,
          class: true,
          attendance: {
            take: 5,
            orderBy: { date: "desc" },
          },
          results: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              subject: true,
            },
          },
        },
      },
    },
  })

  if (!parent) {
    return (
      <div>
        <h1 className="text-3xl font-bold">My Children</h1>
        <p className="text-gray-600">Parent record not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Children</h1>
        <p className="text-gray-600">View information about your children</p>
      </div>

      {parent.students.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No children assigned to your account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parent.students.map((student) => {
            const presentCount = student.attendance.filter(a => a.status === "PRESENT").length
            const totalAttendance = student.attendance.length
            const attendanceRate = totalAttendance > 0 
              ? Math.round((presentCount / totalAttendance) * 100) 
              : 0

            return (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{student.user.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {student.class?.name || "No Class"} • {student.user.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/parent/children/${student.id}/attendance`}>
                        <Button variant="outline" size="sm">
                          View Attendance
                        </Button>
                      </Link>
                      <Link href={`/parent/children/${student.id}/results`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold">{attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recent Results</p>
                      <p className="text-2xl font-bold">{student.results.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Attendance Records</p>
                      <p className="text-2xl font-bold">{totalAttendance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

