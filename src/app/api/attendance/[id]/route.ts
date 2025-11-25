import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateAttendanceSchema.parse(body)

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      )
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(updatedAttendance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update attendance" },
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
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const attendance = await prisma.attendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      )
    }

    await prisma.attendance.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Attendance deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete attendance" },
      { status: 500 }
    )
  }
}

