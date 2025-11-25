import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  classNumber: z.union([z.string(), z.null()]).optional(),
  parentName: z.union([z.string(), z.null()]).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const students = await prisma.student.findMany({
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

    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createStudentSchema.parse(body)

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Find or create class based on class number
    let classId = null
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
    }

    // Find or create parent based on parent name
    let parentId = null
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
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        student: {
          create: {
            classId: classId,
            parentId: parentId,
          },
        },
      },
      include: {
        student: {
          include: {
            class: true,
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(user.student, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    )
  }
}

