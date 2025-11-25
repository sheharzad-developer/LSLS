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

export default async function StudentResultsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      results: {
        include: {
          subject: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!student) {
    return (
      <div>
        <h1 className="text-3xl font-bold">My Results</h1>
        <p className="text-gray-600">Student record not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Results</h1>
        <p className="text-gray-600">View your exam results</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
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

