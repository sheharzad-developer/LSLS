import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parents = await prisma.parent.findMany({
      include: {
        user: true,
      },
    })

    return NextResponse.json(parents)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    )
  }
}

