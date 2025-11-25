import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  classNumber: z.union([z.string(), z.null()]).optional(),
  parentName: z.union([z.string(), z.null()]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
          orderBy: { date: "desc" },
          take: 30,
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
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateStudentSchema.parse(body)

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: student.userId },
        data: updateData,
      })
    }

    // Find or create class based on class number
    let classId = undefined
    if (data.classNumber !== undefined) {
      if (data.classNumber) {
        const className = `Class ${data.classNumber}`
        let classRecord = await prisma.class.findFirst({
          where: { name: className },
        })
        if (!classRecord) {
          classRecord = await prisma.class.create({
            data: { name: className },
          })
        }
        classId = classRecord.id
      } else {
        classId = null
      }
    }

    // Find or create parent based on parent name
    let parentId = undefined
    if (data.parentName !== undefined) {
      if (data.parentName) {
        // First, try to find existing parent by name
        const existingParent = await prisma.parent.findFirst({
          where: {
            user: {
              name: data.parentName,
            },
          },
        })
        
        if (existingParent) {
          parentId = existingParent.id
        } else {
          // Create a new parent user and parent record
          // Generate unique email for the parent
          let parentEmail = `${data.parentName.toLowerCase().replace(/\s+/g, ".")}@parent.lsls`
          let counter = 1
          while (await prisma.user.findUnique({ where: { email: parentEmail } })) {
            parentEmail = `${data.parentName.toLowerCase().replace(/\s+/g, ".")}${counter}@parent.lsls`
            counter++
          }
          
          const parentPassword = await bcrypt.hash("temp123", 10)
          
          const parentUser = await prisma.user.create({
            data: {
              name: data.parentName,
              email: parentEmail,
              password: parentPassword,
              role: "PARENT",
              parent: {
                create: {},
              },
            },
            include: {
              parent: true,
            },
          })
          parentId = parentUser.parent?.id || null
        }
      } else {
        parentId = null
      }
    }

    const updateStudentData: any = {}
    if (classId !== undefined) {
      updateStudentData.classId = classId
    }
    if (parentId !== undefined) {
      updateStudentData.parentId = parentId
    }

    // Only update student if there are changes
    if (Object.keys(updateStudentData).length > 0) {
      await prisma.student.update({
        where: { id },
        data: updateStudentData,
      })
    }

    // Fetch updated student
    const updatedStudent = await prisma.student.findUnique({
      where: { id },
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

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("Update student error:", error)
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to update student"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    await prisma.student.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    )
  }
}

