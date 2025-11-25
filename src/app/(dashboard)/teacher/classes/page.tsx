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

export default async function TeacherClassesPage() {
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
              subjects: true,
            },
          },
        },
      },
    },
  })

  const allClasses = teacher?.classes.map(tc => tc.class) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-gray-600">View your assigned classes</p>
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
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Students: {classItem.students.length} | Subjects: {classItem.subjects.length}
                    </p>
                  </div>
                  {classItem.students.length > 0 && (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classItem.students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.user.name}
                              </TableCell>
                              <TableCell>{student.user.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

