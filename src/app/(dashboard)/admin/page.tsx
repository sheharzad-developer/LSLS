import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, Calendar, UserCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  const [studentsCount, teachersCount, classesCount, attendanceCount, parentsCount] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    }),
    prisma.parent.count(),
  ])

  const navigationCards = [
    {
      title: "Students",
      description: "Manage all students",
      icon: Users,
      href: "/admin/students",
      count: studentsCount,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Teachers",
      description: "Manage all teachers",
      icon: GraduationCap,
      href: "/admin/teachers",
      count: teachersCount,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Parents",
      description: "View all parents",
      icon: UserCircle,
      href: "/admin/parents",
      count: parentsCount,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Classes",
      description: "Manage classes",
      icon: BookOpen,
      href: "/admin/classes",
      count: classesCount,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ]

  const stats = [
    {
      title: "Total Students",
      value: studentsCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Teachers",
      value: teachersCount,
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: "Classes",
      value: classesCount,
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Attendance (30 days)",
      value: attendanceCount,
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">Welcome back, {session?.user.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Navigation</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.title} href={card.href}>
                <Card className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-8 w-8 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-800">{card.count}</span>
                      <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
                        View →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
