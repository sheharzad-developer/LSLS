import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Edit, Mail, User, GraduationCap, Users } from "lucide-react"
import { notFound } from "next/navigation"

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      class: true,
      parent: {
        include: {
          user: true,
        },
      },
      attendance: {
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 20,
      },
      results: {
        include: {
          subject: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!student) {
    notFound()
  }

  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length
  const totalAttendance = student.attendance.length
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{student.user.name}</h1>
            <p className="text-gray-600">Student Details</p>
          </div>
        </div>
        <Link href={`/admin/students/${student.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="font-medium">{student.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {student.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Class</p>
              <p className="font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {student.class?.name || "Not Assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Parent</p>
              <p className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {student.parent?.user.name || "Not Assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-600">{attendanceRate}%</p>
              <p className="text-xs text-gray-500">
                {presentCount} present out of {totalAttendance} records
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Results</p>
              <p className="text-2xl font-bold">{student.results.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Attendance Records</p>
              <p className="text-2xl font-bold">{totalAttendance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
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
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              attendance.status === "PRESENT"
                                ? "bg-green-100 text-green-800"
                                : attendance.status === "LATE"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
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

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  student.results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.subject.name}
                      </TableCell>
                      <TableCell>{result.examType}</TableCell>
                      <TableCell>{result.marks}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {result.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </TableCell>
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

