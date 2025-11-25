import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const managementTeam = [
    {
      name: "Zara Hussain",
      title: "Management Team",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <span>Management Team</span>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-blue-100/50 to-white p-12">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 h-32 w-32 rounded-lg bg-blue-200 blur-2xl"></div>
          <div className="absolute bottom-10 right-10 h-40 w-40 rounded-lg bg-blue-300 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-lg bg-blue-100 blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Management Team
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl">
            Blending decades of global experience across technology, finance, and operations to fuel growth and innovation.
          </p>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {managementTeam.map((member, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Decorative stripes */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 to-blue-200"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 to-blue-200"></div>
            
            <CardContent className="p-6 pt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {member.title}
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                variant="default"
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      <Card className="border-2">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About LSLS</h2>
          <p className="text-gray-600 leading-relaxed">
            LSLS (School Management System) is a comprehensive platform designed to manage
            students, teachers, classes, attendance, and results efficiently. Our system combines
            modern technology with user-friendly interfaces to provide the best experience for
            educational institutions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
