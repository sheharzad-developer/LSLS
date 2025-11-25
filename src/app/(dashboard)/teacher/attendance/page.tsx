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
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      classes: {
        include: {
          class: {
            include: {
              students: {
                include: {
                  user: true,
                  attendance: {
                    where: {
                      date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const allClasses = teacher?.classes.map(tc => tc.class) || []
  const allStudents = allClasses.flatMap(c => c.students) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-gray-600">Mark attendance for your classes</p>
      </div>

      {allClasses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              You are not assigned to any classes yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allClasses.map((classItem) => (
            <Card key={classItem.id}>
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classItem.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500">
                            No students in this class
                          </TableCell>
                        </TableRow>
                      ) : (
                        classItem.students.map((student) => {
                          const todayAttendance = student.attendance[0]
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.user.name}
                              </TableCell>
                              <TableCell>
                                {todayAttendance ? (
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    todayAttendance.status === "PRESENT" 
                                      ? "bg-green-100 text-green-800"
                                      : todayAttendance.status === "LATE"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {todayAttendance.status}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Not marked</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Link href={`/teacher/attendance/${student.id}/mark`}>
                                  <Button variant="outline" size="sm">
                                    {todayAttendance ? "Update" : "Mark"}
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

