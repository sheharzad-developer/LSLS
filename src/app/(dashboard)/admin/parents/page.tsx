import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ParentsPage() {
  const parents = await prisma.parent.findMany({
    include: {
      user: true,
      students: {
        include: {
          user: true,
          class: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parents</h1>
          <p className="text-gray-600">View all parents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Parents ({parents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Children</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No parents found
                    </TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">
                        {parent.user.name}
                      </TableCell>
                      <TableCell>{parent.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{parent.students.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
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

