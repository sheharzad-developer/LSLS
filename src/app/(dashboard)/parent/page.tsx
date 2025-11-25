import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, FileText, UserCircle } from "lucide-react"
import Link from "next/link"

export default async function ParentDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) return null

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          user: true,
          class: true,
          attendance: {
            take: 10,
            orderBy: { date: "desc" },
          },
        }
      }
    }
  })

  const childrenCount = parent?.students.length || 0
  const totalAttendance = parent?.students.reduce((acc, student) => acc + student.attendance.length, 0) || 0

  const navigationCards = [
    {
      title: "My Children",
      description: "View your children's information",
      icon: Users,
      href: "/parent/children",
      count: childrenCount,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Attendance",
      description: "View children's attendance",
      icon: Calendar,
      href: "/parent/attendance",
      count: totalAttendance,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Results",
      description: "View children's results",
      icon: FileText,
      href: "/parent/results",
      count: 0,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Profile",
      description: "View your profile",
      icon: UserCircle,
      href: "#",
      count: 0,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ]

  const stats = [
    {
      title: "My Children",
      value: childrenCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Attendance Records",
      value: totalAttendance,
      icon: Calendar,
      color: "text-green-600",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Parent Dashboard
        </h1>
        <p className="text-lg text-gray-600">Welcome back, {session.user.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
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
                    {card.count > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">{card.count}</span>
                        <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
                          View →
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Children List */}
      {parent && parent.students.length > 0 && (
        <Card className="border-2">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Children</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {parent.students.map((student) => {
                const presentCount = student.attendance.filter(a => a.status === "PRESENT").length
                const totalAtt = student.attendance.length
                const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0
                
                return (
                  <Card key={student.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{student.user.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{student.class?.name || "No Class"}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Attendance: <span className="font-semibold">{attendanceRate}%</span></span>
                            <span className="text-gray-600">Records: <span className="font-semibold">{totalAtt}</span></span>
                          </div>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
