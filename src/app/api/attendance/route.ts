import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createAttendanceSchema = z.object({
  studentId: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  date: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const classId = searchParams.get("classId")
    const date = searchParams.get("date")

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.date = { gte: startDate, lte: endDate }
    }
    if (classId) {
      where.student = { classId }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createAttendanceSchema.parse(body)

    let teacherId: string

    if (session.user.role === "TEACHER") {
      // Teacher marking attendance for a student
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      }

      teacherId = teacher.id
    } else if (session.user.role === "STUDENT") {
      // Student marking their own attendance
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
          class: {
            include: {
              teachers: {
                include: {
                  teacher: true,
                },
                take: 1,
              },
            },
          },
        },
      })

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      // Verify student is marking their own attendance
      if (data.studentId !== student.id) {
        return NextResponse.json({ error: "You can only mark your own attendance" }, { status: 403 })
      }

      // Find a teacher from the student's class
      if (student.class && student.class.teachers.length > 0) {
        teacherId = student.class.teachers[0].teacher.id
      } else {
        // If no teacher assigned to class, find any teacher (fallback)
        const anyTeacher = await prisma.teacher.findFirst()
        if (!anyTeacher) {
          return NextResponse.json({ error: "No teacher available to mark attendance" }, { status: 404 })
        }
        teacherId = anyTeacher.id
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendanceDate = data.date ? new Date(data.date) : new Date()
    const startOfDay = new Date(attendanceDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(attendanceDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (existingAttendance) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: data.status,
          teacherId: teacherId,
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
      return NextResponse.json(updated, { status: 200 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        teacherId: teacherId,
        status: data.status,
        date: attendanceDate,
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

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create attendance" },
      { status: 500 }
    )
  }
}

