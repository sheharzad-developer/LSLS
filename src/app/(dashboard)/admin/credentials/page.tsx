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
import Link from "next/link"
import { Key, Eye, EyeOff } from "lucide-react"
import { ResetPasswordDialog } from "./reset-password-dialog"

export const dynamic = 'force-dynamic'

export default async function CredentialsPage() {
  const users = await prisma.user.findMany({
    include: {
      student: true,
      teacher: true,
      parent: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Credentials</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and reset passwords</p>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                let accountType = "User"
                if (user.student) accountType = "Student"
                else if (user.teacher) accountType = "Teacher"
                else if (user.parent) accountType = "Parent"
                else if (user.role === "ADMIN") accountType = "Admin"

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>{accountType}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ResetPasswordDialog userId={user.id} userEmail={user.email} userName={user.name} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

