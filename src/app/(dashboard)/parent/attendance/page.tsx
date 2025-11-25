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

export default async function ParentAttendancePage() {
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
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { date: "desc" },
            take: 30,
          },
        },
      },
    },
  })

  if (!parent) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-gray-600">Parent record not found</p>
      </div>
    )
  }

  const allAttendance = parent.students.flatMap(student => 
    student.attendance.map(att => ({ ...att, studentName: student.user.name }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Children's Attendance</h1>
        <p className="text-gray-600">View attendance records for all your children</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  allAttendance.map((attendance) => {
                    const attendanceDate = new Date(attendance.date)
                    return (
                      <TableRow key={attendance.id}>
                        <TableCell className="font-medium">
                          {attendance.studentName}
                        </TableCell>
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

