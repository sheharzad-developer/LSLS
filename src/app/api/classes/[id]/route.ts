import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  studentIds: z.array(z.string()).optional(),
  teacherIds: z.array(z.string()).optional(),
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
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: true,
          },
        },
        teachers: {
          include: {
            user: true,
          },
        },
        subjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json(classData)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch class" },
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
    const data = updateClassSchema.parse(body)

    const updateData: any = {}
    if (data.name) updateData.name = data.name

    if (data.studentIds) {
      updateData.students = {
        set: data.studentIds.map((id) => ({ id })),
      }
    }

    if (data.teacherIds) {
      updateData.teachers = {
        set: data.teacherIds.map((id) => ({ id })),
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        students: {
          include: {
            user: true,
          },
        },
        teachers: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update class" },
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
    const classData = await prisma.class.findUnique({
      where: { id },
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    await prisma.class.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Class deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    )
  }
}

