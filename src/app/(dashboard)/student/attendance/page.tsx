import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AttendanceCards } from "@/components/student/attendance-cards"

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      attendance: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 50,
      },
    },
  })

  if (!student) {
    return (
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-gray-600">Student record not found</p>
      </div>
    )
  }

  // Check if today's attendance is already marked
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)
  
  const todayAttendance = student.attendance.find(a => {
    const attendanceDate = new Date(a.date)
    return attendanceDate >= today && attendanceDate <= todayEnd
  })

  const presentCount = student.attendance.filter(a => a.status === "PRESENT").length
  const absentCount = student.attendance.filter(a => a.status === "ABSENT").length
  const lateCount = student.attendance.filter(a => a.status === "LATE").length
  const totalCount = student.attendance.length
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-gray-600">View and mark your attendance</p>
        </div>
        <Link href={`/student/attendance/mark`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {todayAttendance ? "Update Today's Attendance" : "Mark Today's Attendance"}
          </Button>
        </Link>
      </div>

      {/* Quick Mark Attendance Cards */}
      <AttendanceCards 
        studentId={student.id} 
        todayAttendance={todayAttendance ? { id: todayAttendance.id, status: todayAttendance.status } : null}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  student.attendance.map((attendance) => {
                    const attendanceDate = new Date(attendance.date)
                    return (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          {attendanceDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {attendanceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            attendance.status === "PRESENT" 
                              ? "bg-green-100 text-green-800"
                              : attendance.status === "LATE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {attendance.status}
                          </span>
                        </TableCell>
                        <TableCell>{attendance.teacher.user.name}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

