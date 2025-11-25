import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateTeacherSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  classIds: z.array(z.string()).optional(),
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
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        classes: {
          include: {
            class: true,
          },
        },
        subjects: {
          include: {
            class: true,
          },
        },
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
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
    const data = updateTeacherSchema.parse(body)

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: updateData,
      })
    }

    let updatedTeacher
    if (data.classIds) {
      // Delete existing TeacherClass records
      await prisma.teacherClass.deleteMany({
        where: { teacherId: id },
      })
      
      // Create new TeacherClass records
      await prisma.teacherClass.createMany({
        data: data.classIds.map((classId) => ({
          teacherId: id,
          classId,
        })),
      })
    }
    
    updatedTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        classes: {
          include: {
            class: true,
          },
        },
        subjects: true,
      },
    })

    return NextResponse.json(updatedTeacher)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update teacher" },
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
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    await prisma.teacher.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Teacher deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    )
  }
}

