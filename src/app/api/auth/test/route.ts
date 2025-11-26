import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Count users
    const userCount = await prisma.user.count()
    
    // Check environment variables (without exposing secrets)
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
    
    return NextResponse.json({
      status: "ok",
      database: {
        connected: true,
        userCount,
      },
      environment: {
        DATABASE_URL: hasDatabaseUrl ? "✅ Set" : "❌ Missing",
        NEXTAUTH_SECRET: hasNextAuthSecret ? "✅ Set" : "❌ Missing",
        NEXTAUTH_URL: hasNextAuthUrl ? `✅ Set (${process.env.NEXTAUTH_URL})` : "❌ Missing",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
          NEXTAUTH_URL: process.env.NEXTAUTH_URL ? `✅ Set (${process.env.NEXTAUTH_URL})` : "❌ Missing",
        },
      },
      { status: 500 }
    )
  }
}

