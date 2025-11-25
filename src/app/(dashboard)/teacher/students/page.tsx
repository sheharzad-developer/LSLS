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

export default async function TeacherStudentsPage() {
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
                },
              },
            },
          },
        },
      },
    },
  })

  const allStudents = teacher?.classes.flatMap(tc => tc.class.students) || []
  const uniqueStudents = Array.from(
    new Map(allStudents.map(s => [s.id, s])).values()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-gray-600">View all students in your classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students ({uniqueStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  uniqueStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.user.name}
                      </TableCell>
                      <TableCell>{student.user.email}</TableCell>
                      <TableCell>{student.classId || "Not Assigned"}</TableCell>
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

