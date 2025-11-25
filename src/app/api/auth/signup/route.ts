import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signupSchema.parse(body)

    // Normalize email to lowercase and trim
    const normalizedEmail = data.email.trim().toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user and role-specific record
    if (data.role === "STUDENT") {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: data.role,
          student: {
            create: {},
          },
        },
        include: {
          student: true,
        },
      })
      return NextResponse.json(
        { message: "Student account created successfully", userId: user.id },
        { status: 201 }
      )
    }

    if (data.role === "TEACHER") {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: data.role,
          teacher: {
            create: {},
          },
        },
        include: {
          teacher: true,
        },
      })
      return NextResponse.json(
        { message: "Teacher account created successfully", userId: user.id },
        { status: 201 }
      )
    }

    if (data.role === "PARENT") {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: data.role,
          parent: {
            create: {},
          },
        },
        include: {
          parent: true,
        },
      })
      return NextResponse.json(
        { message: "Parent account created successfully", userId: user.id },
        { status: 201 }
      )
    }

    if (data.role === "ADMIN") {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: data.role,
        },
      })
      return NextResponse.json(
        { message: "Admin account created successfully", userId: user.id },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}

