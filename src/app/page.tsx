import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role) {
      redirect(`/${session.user.role.toLowerCase()}`)
    }

    return <LandingPage />
  } catch (error) {
    console.error("Home page error:", error)
    return <LandingPage />
  }
}

