"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
  UserCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Role } from "@/types/role"

interface SidebarProps {
  role: Role
  userName: string
}

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/admin/classes", label: "Classes", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
]

const teacherLinks = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "My Classes", icon: BookOpen },
  { href: "/teacher/attendance", label: "Attendance", icon: Calendar },
  { href: "/teacher/results", label: "Results", icon: FileText },
  { href: "/about", label: "About", icon: Info },
]

const studentLinks = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/attendance", label: "My Attendance", icon: Calendar },
  { href: "/student/results", label: "My Results", icon: FileText },
  { href: "/student/profile", label: "Profile", icon: UserCircle },
  { href: "/about", label: "About", icon: Info },
]

const parentLinks = [
  { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parent/children", label: "My Children", icon: Users },
  { href: "/parent/attendance", label: "Attendance", icon: Calendar },
  { href: "/parent/results", label: "Results", icon: FileText },
  { href: "/about", label: "About", icon: Info },
]

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()

  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return adminLinks
      case "TEACHER":
        return teacherLinks
      case "STUDENT":
        return studentLinks
      case "PARENT":
        return parentLinks
      default:
        return []
    }
  }

  const links = getLinks()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <img 
          src="/logo/images.jpeg" 
          alt="LSLS Logo" 
          className="h-10 w-10 rounded-lg object-cover"
        />
        <h1 className="text-xl font-bold text-primary">LSLS</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-gray-700">{userName}</p>
          <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            const origin = typeof window !== 'undefined' ? window.location.origin : ''
            signOut({ callbackUrl: `${origin}/login` })
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

