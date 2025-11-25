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

  const presentCount = student.attendance.filter(a => a.status === "PRESENT").length
  const absentCount = student.attendance.filter(a => a.status === "ABSENT").length
  const lateCount = student.attendance.filter(a => a.status === "LATE").length
  const totalCount = student.attendance.length
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-gray-600">View your attendance history</p>
      </div>

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
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  student.attendance.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>
                        {new Date(attendance.date).toLocaleDateString()}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

