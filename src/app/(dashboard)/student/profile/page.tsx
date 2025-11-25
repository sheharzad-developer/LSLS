import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      class: true,
      parent: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!student) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600">Student record not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-600">View your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-medium">{student.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium">{student.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Class</p>
            <p className="text-lg font-medium">{student.class?.name || "Not Assigned"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Parent</p>
            <p className="text-lg font-medium">{student.parent?.user.name || "Not Assigned"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

