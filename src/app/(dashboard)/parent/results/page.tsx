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

export default async function ParentResultsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          user: true,
          results: {
            include: {
              subject: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!parent) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Results</h1>
        <p className="text-gray-600">Parent record not found</p>
      </div>
    )
  }

  const allResults = parent.students.flatMap(student => 
    student.results.map(result => ({ ...result, studentName: student.user.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Children's Results</h1>
        <p className="text-gray-600">View exam results for all your children</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  allResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.studentName}
                      </TableCell>
                      <TableCell>{result.subject.name}</TableCell>
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

